import 'dotenv/config';
import {
    BadRequestException,
    Controller,
    Headers,
    Post,
    Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { RazorpayWebhookPayload } from './interfaces/razorpay-webhook-payload.interface';
import { RazorpaySignatureService } from './razorpay-signature.service';
import { RazorpayWebhookService } from './razorpay-webhook.service';

@Controller('webhooks')
export class RazorpayWebhookController {
    constructor(
        private readonly signatureService: RazorpaySignatureService,
        private readonly webhookService: RazorpayWebhookService,
    ) {}

    @Post('razorpay')
    async razorpayWebhook(
        @Headers('x-razorpay-signature') signature: string,
        @Req() request: Request,
        @Headers('x-razorpay-event-id') eventId: string,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing Razorpay signature');
        }

        if (!eventId) {
            throw new BadRequestException('Missing Razorpay event ID');
        }

        if (!request.rawBody) {
            throw new BadRequestException('Raw request body is unavailable');
        }

        this.signatureService.verify(
            request.rawBody,
            signature,
            process.env.RAZORPAY_WEBHOOK_SECRET!,
        );

        const payload = request.body as RazorpayWebhookPayload;

        await this.webhookService.handle(eventId, payload);

        return {
            received: true,
        };
    }
}
