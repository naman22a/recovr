import { Migration } from '@mikro-orm/migrations';

export class Migration20260901150825 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "recovery_attempt" drop constraint if exists "recovery_attempt_status_check";');

    this.addSql('alter table "recovery_attempt" alter column "status" type text using ("status"::text);');
    this.addSql('alter table "recovery_attempt" add constraint "recovery_attempt_status_check" check ("status" in (\'pending\', \'processing\', \'completed\', \'failed\', \'stopped\', \'waiting_for_customer\'));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "recovery_attempt" drop constraint if exists "recovery_attempt_status_check";');

    this.addSql('alter table "recovery_attempt" alter column "status" type text using ("status"::text);');
    this.addSql('alter table "recovery_attempt" add constraint "recovery_attempt_status_check" check ("status" in (\'pending\', \'processing\', \'completed\', \'failed\', \'stopped\'));');
  }

}
