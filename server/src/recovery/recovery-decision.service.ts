import { Injectable } from '@nestjs/common';
import { RecoveryStrategy } from '../models/recovery-attempt.model';

export interface RecoveryDecision {
    strategy: RecoveryStrategy;
    reason: string;
}

@Injectable()
export class RecoveryDecisionService {
    decide(errorCode?: string): RecoveryDecision {
        switch (errorCode) {
            case 'NETWORK_ERROR':
            case 'GATEWAY_ERROR':
                return {
                    strategy: RecoveryStrategy.RETRY_PAYMENT,
                    reason: `Temporary ${errorCode.toLowerCase()} detected; payment retry is appropriate`,
                };

            case 'BAD_REQUEST_ERROR':
                return {
                    strategy: RecoveryStrategy.CUSTOMER_RETRY,
                    reason: 'Payment request was rejected; customer should retry after correcting the issue',
                };

            default:
                return {
                    strategy: RecoveryStrategy.MANUAL_REVIEW,
                    reason: 'Unknown payment failure; automatic recovery is not safe',
                };
        }
    }
}
