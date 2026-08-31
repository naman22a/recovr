import 'dotenv/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class RazorpaySignatureService {
    verify(rawBody: Buffer, signature: string, secret: string): void {
        const expectedSignature = createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        const expected = Buffer.from(expectedSignature, 'utf8');
        const received = Buffer.from(signature, 'utf8');

        if (
            expected.length !== received.length ||
            !timingSafeEqual(expected, received)
        ) {
            throw new UnauthorizedException(
                'Invalid Razorpay webhook signature',
            );
        }
    }
}
