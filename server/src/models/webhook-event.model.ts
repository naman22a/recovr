import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class WebhookEvent {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    eventId!: string;

    @Property()
    eventType!: string;

    @Property()
    payload!: object;

    @Property()
    receivedAt: Date = new Date();
}
