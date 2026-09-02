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

        const successfulRecoveryPaymentIds = new Set(
            attempts
                .filter(
                    (attempt) =>
                        attempt.status === RecoveryAttemptStatus.COMPLETED,
                )
                .map((attempt) => attempt.payment.id),
        );

        const successfulRecoveries = successfulRecoveryPaymentIds.size;

        const waitingForCustomer = attempts.filter(
            (attempt) =>
                attempt.status === RecoveryAttemptStatus.WAITING_FOR_CUSTOMER,
        ).length;

        const failedRecoveries = new Set(
            attempts
                .filter(
                    (attempt) =>
                        attempt.status === RecoveryAttemptStatus.FAILED,
                )
                .map((attempt) => attempt.payment.id),
        ).size;

        const stoppedPaymentIds = new Set(
            attempts
                .filter(
                    (attempt) =>
                        attempt.status === RecoveryAttemptStatus.STOPPED,
                )
                .map((attempt) => attempt.payment.id),
        );

        const stoppedRecoveries = stoppedPaymentIds.size;

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

    async getHistory() {
        const attempts = await this.em.find(
            RecoveryAttempt,
            {},
            {
                populate: ['payment'],
                orderBy: {
                    createdAt: 'DESC',
                },
            },
        );

        return attempts.map((attempt) => ({
            attemptId: attempt.id,
            paymentId: attempt.payment.id,
            razorpayPaymentId: attempt.payment.razorpayPaymentId,

            amount: attempt.payment.amount,
            currency: attempt.payment.currency,
            method: attempt.payment.method,

            attemptNumber: attempt.attemptNumber,
            maxAttempts: attempt.maxAttempts,

            strategy: attempt.strategy,
            confidence: attempt.confidence,
            decisionSource: attempt.decisionSource,
            reason: attempt.reason,

            status: attempt.status,
            result: attempt.result,
            failureReason: attempt.failureReason,

            amountRecovered: attempt.amountRecovered ?? 0,

            createdAt: attempt.createdAt,
            completedAt: attempt.completedAt,
        }));
    }

    async getPaymentRecovery(paymentId: number) {
        const payment = await this.em.findOneOrFail(Payment, paymentId);

        const attempts = await this.em.find(
            RecoveryAttempt,
            {
                payment: payment.id,
            },
            {
                orderBy: {
                    attemptNumber: 'ASC',
                },
            },
        );

        return {
            payment: {
                id: payment.id,
                razorpayPaymentId: payment.razorpayPaymentId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                errorCode: payment.errorCode,
                errorDescription: payment.errorDescription,
            },

            recoveryAttempts: attempts.map((attempt) => ({
                id: attempt.id,
                attemptNumber: attempt.attemptNumber,
                maxAttempts: attempt.maxAttempts,

                strategy: attempt.strategy,
                confidence: attempt.confidence,
                decisionSource: attempt.decisionSource,
                reason: attempt.reason,

                status: attempt.status,
                result: attempt.result,
                failureReason: attempt.failureReason,
                amountRecovered: attempt.amountRecovered ?? 0,

                createdAt: attempt.createdAt,
                completedAt: attempt.completedAt,
            })),
        };
    }
}
