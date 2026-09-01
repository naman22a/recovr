import { Migration } from '@mikro-orm/migrations';

export class Migration20260901093914 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "payment" ("id" serial primary key, "razorpay_payment_id" varchar(255) not null, "amount" int not null, "currency" varchar(255) not null, "status" varchar(255) not null, "method" varchar(255) null, "error_code" varchar(255) null, "error_description" varchar(255) null);');
    this.addSql('alter table "payment" add constraint "payment_razorpay_payment_id_unique" unique ("razorpay_payment_id");');

    this.addSql('create table "webhook_event" ("id" serial primary key, "event_id" varchar(255) not null, "event_type" varchar(255) not null, "payload" jsonb not null, "received_at" timestamptz(0) not null);');
    this.addSql('alter table "webhook_event" add constraint "webhook_event_event_id_unique" unique ("event_id");');
  }

}
