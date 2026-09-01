import { Module } from '@nestjs/common';
import { RazorpayWebhookController } from './razorpay/razorpay-webhook.controller';
import { RazorpayWebhookService } from './razorpay/razorpay-webhook.service';
import { RazorpaySignatureService } from './razorpay/razorpay-signature.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WebhookEvent } from '../models/webhook-event.model';
import { Payment } from '../models/payment.model';
import { RecoveryModule } from '../recovery/recovery.module';

@Module({
    imports: [
        MikroOrmModule.forFeature({
            entities: [WebhookEvent, Payment],
        }),
        RecoveryModule,
    ],
    controllers: [RazorpayWebhookController],
    providers: [RazorpayWebhookService, RazorpaySignatureService],
})
export class WebhooksModule {}
