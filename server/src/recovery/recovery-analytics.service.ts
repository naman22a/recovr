import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
    RecoveryAttempt,
    RecoveryAttemptStatus,
} from '../models/recovery-attempt.model';
import { Payment } from '../models/payment.model';

@Injectable()
export class RecoveryAnalyticsService {
    constructor(private readonly em: EntityManager) {}

    async getMetrics() {
        const payments = await this.em.find(Payment, {
            status: 'failed',
        });

        const attempts = await this.em.find(
            RecoveryAttempt,
            {},
            {
                populate: ['payment'],
            },
        );

        const recoveredPaymentIds = new Set(
            attempts
                .filter(
                    (attempt) =>
                        attempt.status === RecoveryAttemptStatus.COMPLETED,
                )
                .map((attempt) => attempt.payment.id),
        );

        const atRiskPayments = payments.filter(
            (payment) => !recoveredPaymentIds.has(payment.id),
        );

        const totalAmountAtRisk = atRiskPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0,
        );

        const amountRecovered = attempts.reduce(
            (sum, attempt) => sum + (attempt.amountRecovered ?? 0),
            0,
        );

        const successfulRecoveries = attempts.filter(
            (attempt) => attempt.status === RecoveryAttemptStatus.COMPLETED,
        ).length;

        const waitingForCustomer = attempts.filter(
            (attempt) =>
                attempt.status === RecoveryAttemptStatus.WAITING_FOR_CUSTOMER,
        ).length;

        const failedRecoveries = attempts.filter(
            (attempt) => attempt.status === RecoveryAttemptStatus.FAILED,
        ).length;

        const stoppedRecoveries = attempts.filter(
            (attempt) => attempt.status === RecoveryAttemptStatus.STOPPED,
        ).length;

        const recoveryRate =
            payments.length === 0
                ? 0
                : (successfulRecoveries / payments.length) * 100;

        return {
            paymentsAtRisk: atRiskPayments.length,

            totalAmountAtRisk,

            totalRecoveryAttempts: attempts.length,

            successfulRecoveries,

            amountRecovered,

            recoveryRate: Number(recoveryRate.toFixed(2)),

            waitingForCustomer,

            failedRecoveries,

            stoppedRecoveries,
        };
    }
}
