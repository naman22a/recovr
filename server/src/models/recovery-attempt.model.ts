import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Payment } from './payment.model';

export enum RecoveryAttemptStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    STOPPED = 'stopped',
}

export enum RecoveryStrategy {
    RETRY_PAYMENT = 'retry_payment',
    CUSTOMER_RETRY = 'customer_retry',
    MANUAL_REVIEW = 'manual_review',
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

    @Property({ nullable: true })
    result?: string;

    @Property()
    createdAt: Date = new Date();

    @Property({ nullable: true })
    completedAt?: Date;
}
