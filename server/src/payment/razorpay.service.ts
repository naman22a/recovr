import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
    private readonly razorpay: Razorpay;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }

    async fetchPayment(paymentId: string) {
        return this.razorpay.payments.fetch(paymentId);
    }
}
