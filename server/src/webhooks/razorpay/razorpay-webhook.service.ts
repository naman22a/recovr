import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { RazorpayWebhookPayload } from './interfaces/razorpay-webhook-payload.interface';

@Injectable()
export class RazorpayWebhookService {
    handle(
        signature: string,
        rawBody: Request['rawBody'],
        payload: RazorpayWebhookPayload,
    ) {}
}
