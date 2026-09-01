import { Migration } from '@mikro-orm/migrations';

export class Migration20260901140532 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "recovery_attempt" ("id" serial primary key, "payment_id" int not null, "status" text check ("status" in (\'pending\', \'processing\', \'completed\', \'failed\', \'stopped\')) not null default \'pending\', "strategy" text check ("strategy" in (\'retry_payment\', \'customer_retry\', \'manual_review\')) not null, "reason" varchar(255) null, "result" varchar(255) null, "created_at" timestamptz(0) not null, "completed_at" timestamptz(0) null);');

    this.addSql('alter table "recovery_attempt" add constraint "recovery_attempt_payment_id_foreign" foreign key ("payment_id") references "payment" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "recovery_attempt" cascade;');
  }

}
