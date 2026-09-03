import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Payment } from './payment.model';

export enum RecoveryAttemptStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    STOPPED = 'stopped',
    WAITING_FOR_CUSTOMER = 'waiting_for_customer',
}

export enum RecoveryStrategy {
    RETRY_PAYMENT = 'retry_payment',
    CUSTOMER_RETRY = 'customer_retry',
    MANUAL_REVIEW = 'manual_review',
}

export enum RecoveryDecisionSource {
    AI = 'ai',
}

@Entity()
export class RecoveryAttempt {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Payment)
    payment!: Payment;

    @Enum(() => RecoveryAttemptStatus)
    status: RecoveryAttemptStatus = RecoveryAttemptStatus.PENDING;

    @Enum(() => RecoveryStrategy)
    strategy!: RecoveryStrategy;

    @Property({ nullable: true })
    reason?: string;

    @Property({ nullable: true, type: 'numeric', precision: 3, scale: 2 })
    confidence?: number;

    @Enum(() => RecoveryDecisionSource)
    decisionSource: RecoveryDecisionSource = RecoveryDecisionSource.AI;

    @Property({ nullable: true })
    result?: string;

    @Property({ nullable: true })
    amountRecovered?: number;

    @Property({ nullable: true })
    failureReason?: string;

    @Property()
    attemptNumber: number = 1;

    @Property()
    maxAttempts: number = 3;

    @Property()
    createdAt: Date = new Date();

    @Property({ nullable: true })
    completedAt?: Date;
}
