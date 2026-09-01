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
                id: 'pay_test_metrics_001',
                entity: 'payment',
                amount: 750000,
                currency: 'INR',
                status: 'failed',
                order_id: 'order_metrics_001',
                method: 'upi',
                description: 'Metrics test payment',
                email: 'test@example.com',
                contact: '+919999999999',
                error_code: 'GATEWAY_ERROR',
                error_description: 'Temporary gateway failure',
                error_source: 'gateway',
                error_step: 'payment_authorization',
                error_reason: 'gateway_error',
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
