import { Migration } from '@mikro-orm/migrations';

export class Migration20260901144919 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "recovery_attempt" add column "amount_recovered" int null, add column "failure_reason" varchar(255) null, add column "attempt_number" int not null default 1, add column "max_attempts" int not null default 3;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "recovery_attempt" drop column "amount_recovered";');
    this.addSql('alter table "recovery_attempt" drop column "failure_reason";');
    this.addSql('alter table "recovery_attempt" drop column "attempt_number";');
    this.addSql('alter table "recovery_attempt" drop column "max_attempts";');
  }

}
