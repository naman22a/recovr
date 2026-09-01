import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

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
}
