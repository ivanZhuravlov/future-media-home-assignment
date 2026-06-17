import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageIndexes1740000000002 implements MigrationInterface {
  name = 'AddMessageIndexes1740000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "idx_messages_created_at"
        ON "messages" ("created_at" DESC, "id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_messages_tag_created_at"
        ON "messages" ("tag", "created_at" DESC, "id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_messages_author_created_at"
        ON "messages" ("author_id", "created_at" DESC, "id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_messages_author_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_messages_tag_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_messages_created_at"`);
  }
}
