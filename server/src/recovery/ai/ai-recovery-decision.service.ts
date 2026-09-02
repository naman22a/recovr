import { Injectable } from '@nestjs/common';
import { RecoveryStrategy } from '../../common/enums';

export interface RecoveryContext {
    paymentId: number;
    amount: number;
    currency: string;
    method: string;
    errorCode?: string;
    errorDescription?: string;
    attemptNumber: number;
    maxAttempts: number;
}

export interface AIRecoveryDecision {
    strategy: RecoveryStrategy;
    confidence: number;
    reason: string;
}

@Injectable()
export class AIRecoveryDecisionService {
    async decide(context: RecoveryContext): Promise<AIRecoveryDecision> {
        switch (context.errorCode) {
            case 'GATEWAY_ERROR':
                return {
                    strategy: RecoveryStrategy.RETRY_PAYMENT,
                    confidence: 0.92,
                    reason: 'Temporary gateway failure suggests that retrying the payment may recover it.',
                };

            case 'BAD_REQUEST_ERROR':
                return {
                    strategy: RecoveryStrategy.CUSTOMER_RETRY,
                    confidence: 0.88,
                    reason: 'The payment request was rejected, so the customer should retry after correcting the issue.',
                };

            default:
                return {
                    strategy: RecoveryStrategy.MANUAL_REVIEW,
                    confidence: 0.6,
                    reason: 'The payment failure is not recognized as safely recoverable automatically, so manual review is required.',
                };
        }
    }
}
