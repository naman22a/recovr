import { Migration } from '@mikro-orm/migrations';

export class Migration20260902141637 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "recovery_attempt" add column "decision_source" text check ("decision_source" in (\'ai\')) not null default \'ai\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "recovery_attempt" drop column "decision_source";');
  }

}
