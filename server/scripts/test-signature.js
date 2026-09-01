require('dotenv').config();
const crypto = require('crypto');

const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

const body = JSON.stringify({
    entity: 'event',
    account_id: 'acc_test123',
    event: 'payment.failed',
    contains: ['payment'],
    payload: {
        payment: {
            entity: {
                id: 'pay_test9752346972345',
                entity: 'payment',
                amount: 500000,
                currency: 'INR',
                status: 'failed',
                order_id: 'order_test123',
                method: 'upi',
                description: 'Test payment',
                email: 'test@example.com',
                contact: '+919999999999',
                error_code: 'GATEWAY_ERROR',
                error_description: 'Payment failed for testing',
                error_source: 'bank',
                error_step: 'payment_authorization',
                error_reason: 'payment_failed',
                created_at: 1756640000,
            },
        },
    },
});

const signature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

console.log('BODY:');
console.log(body);
console.log('\nSIGNATURE:');
console.log(signature);
