import { Injectable } from '@nestjs/common';
import type { RazorpayWebhookPayload } from './interfaces/razorpay-webhook-payload.interface';
import { EntityManager } from '@mikro-orm/postgresql';
import { WebhookEvent } from '../../models/webhook-event.model';
import { Payment } from '../../models/payment.model';
import { RecoveryService } from '../../recovery/recovery.service';
import { RecoveryStrategy } from '../../models/recovery-attempt.model';

@Injectable()
export class RazorpayWebhookService {
    constructor(
        private readonly em: EntityManager,
        private readonly recoveryService: RecoveryService,
    ) {}

    async handle(eventId: string, payload: RazorpayWebhookPayload) {
        // Ignore events that we don't currently handle
        if (payload.event !== 'payment.failed') {
            return;
        }

        // Prevent duplicate webhook processing
        const existingEvent = await this.em.findOne(WebhookEvent, { eventId });

        if (existingEvent) {
            console.log(`Webhook ${eventId} already processed`);
            return;
        }

        const payment = payload.payload.payment.entity;

        // Store the webhook event
        const webhookEvent = new WebhookEvent();

        webhookEvent.eventId = eventId;
        webhookEvent.eventType = payload.event;
        webhookEvent.payload = payload;

        // Store the failed payment
        const paymentEntity = new Payment();

        paymentEntity.razorpayPaymentId = payment.id;
        paymentEntity.amount = payment.amount;
        paymentEntity.currency = payment.currency;
        paymentEntity.status = payment.status;
        paymentEntity.method = payment.method;
        paymentEntity.errorCode = payment.error_code!;
        paymentEntity.errorDescription = payment.error_description!;

        this.em.persist(webhookEvent);
        this.em.persist(paymentEntity);

        await this.em.flush();

        await this.recoveryService.createAttempt(
            paymentEntity,
            RecoveryStrategy.CUSTOMER_RETRY,
            'Payment failed and requires customer retry',
        );

        console.log(`Processed payment.failed: ${payment.id}`);
    }
}
