import { Injectable } from '@nestjs/common';
import type { RazorpayWebhookPayload } from './interfaces/razorpay-webhook-payload.interface';
import { EntityManager } from '@mikro-orm/postgresql';
import { WebhookEvent } from '../../models/webhook-event.model';
import { Payment } from '../../models/payment.model';
import { RecoveryService } from '../../recovery/recovery.service';
import { AIRecoveryDecisionService } from '../../recovery/ai/ai-recovery-decision.service';
import { RecoveryAttempt } from '../../models/recovery-attempt.model';

@Injectable()
export class RazorpayWebhookService {
    constructor(
        private readonly em: EntityManager,
        private readonly recoveryService: RecoveryService,
        private readonly aiDecisionService: AIRecoveryDecisionService,
    ) {}

    async handle(eventId: string, payload: RazorpayWebhookPayload) {
        const em = this.em.fork();

        // Ignore events that we don't currently handle
        if (payload.event !== 'payment.failed') {
            return;
        }

        // Prevent duplicate webhook processing
        const existingEvent = await em.findOne(WebhookEvent, { eventId });

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

        em.persist(webhookEvent);
        em.persist(paymentEntity);

        await em.flush();

        const previousAttempts = await em.find(RecoveryAttempt, {
            payment: paymentEntity,
        });

        const decision = await this.aiDecisionService.decide({
            paymentId: paymentEntity.id,
            amount: paymentEntity.amount,
            currency: paymentEntity.currency,
            method: paymentEntity.method!,
            errorCode: paymentEntity.errorCode,
            errorDescription: paymentEntity.errorDescription,
            attemptNumber: 1,
            maxAttempts: 3,
            previousAttempts: previousAttempts.length,
        });

        console.log('AI Recovery Decision:', decision);

        await this.recoveryService.createAttempt(
            paymentEntity,
            decision.strategy,
            decision.reason,
            decision.confidence,
            em,
        );

        console.log(`Processed payment.failed: ${payment.id}`);
    }
}
