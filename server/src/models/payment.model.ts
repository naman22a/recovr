import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Collection, OneToMany } from '@mikro-orm/core';
import { RecoveryAttempt } from './recovery-attempt.model';

@Entity()
export class Payment {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    razorpayPaymentId!: string;

    @Property()
    amount!: number;

    @Property()
    currency!: string;

    @Property()
    status!: string;

    @Property({ nullable: true })
    method?: string;

    @Property({ nullable: true })
    errorCode?: string;

    @Property({ nullable: true })
    errorDescription?: string;

    @OneToMany(
        () => RecoveryAttempt,
        (recoveryAttempt) => recoveryAttempt.payment,
    )
    recoveryAttempts = new Collection<RecoveryAttempt>(this);
}
