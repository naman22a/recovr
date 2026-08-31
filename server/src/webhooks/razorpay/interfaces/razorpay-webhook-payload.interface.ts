export interface RazorpayWebhookPayload {
    entity: 'event';
    account_id: string;
    event: string;
    contains: string[];
    payload: {
        payment: {
            entity: {
                id: string;
                entity: 'payment';
                amount: number;
                currency: string;
                status: string;
                order_id: string | null;
                method: string;
                description: string | null;
                email: string | null;
                contact: string | null;
                error_code: string | null;
                error_description: string | null;
                error_source: string | null;
                error_step: string | null;
                error_reason: string | null;
                created_at: number;
            };
        };
    };
}
