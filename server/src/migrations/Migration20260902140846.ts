import { Migration } from '@mikro-orm/migrations';

export class Migration20260902140846 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "recovery_attempt" add column "confidence" int null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "recovery_attempt" drop column "confidence";');
  }

}
