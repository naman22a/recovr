import { Migration } from '@mikro-orm/migrations';

export class Migration20260903045618 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "recovery_attempt" alter column "confidence" type numeric(3,2) using ("confidence"::numeric(3,2));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "recovery_attempt" alter column "confidence" type int4 using ("confidence"::int4);');
  }

}
