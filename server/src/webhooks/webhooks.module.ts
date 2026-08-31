import { Module } from '@nestjs/common';
import { RazorpayWebhookController } from './razorpay/razorpay-webhook.controller';
import { RazorpayWebhookService } from './razorpay/razorpay-webhook.service';
import { RazorpaySignatureService } from './razorpay/razorpay-signature.service';

@Module({
    controllers: [RazorpayWebhookController],
    providers: [RazorpayWebhookService, RazorpaySignatureService],
})
export class WebhooksModule {}
