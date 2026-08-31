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

@Controller('webhooks')
export class RazorpayWebhookController {
    constructor(private readonly signatureService: RazorpaySignatureService) {}

    @Post('razorpay')
    async razorpayWebhook(
        @Headers('x-razorpay-signature') signature: string,
        @Req() request: Request,
        @Headers('x-razorpay-event-id') eventId: string,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing Razorpay signature');
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

        console.log('Razorpay event:', payload.event);

        console.log('Event ID:', eventId);
        console.log('Event:', request.body.event);

        if (request.body.event !== 'payment.failed') {
            return {
                received: true,
            };
        }

        const payment = payload.payload.payment.entity;

        console.log({
            paymentId: payment.id,
            amount: payment.amount,
            status: payment.status,
            method: payment.method,
            errorCode: payment.error_code,
            errorDescription: payment.error_description,
        });

        return {
            received: true,
        };
    }
}
