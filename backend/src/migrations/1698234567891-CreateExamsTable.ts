import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateExamsTable1698234567891 implements MigrationInterface {
  name = 'CreateExamsTable1698234567891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'exams',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'idempotencyKey',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'examDate',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'modality',
            type: 'enum',
            enum: ['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'],
            isNullable: false,
          },
          {
            name: 'observations',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'],
            default: "'AGENDADO'",
          },
          {
            name: 'patientId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_EXAM_IDEMPOTENCY_KEY',
            columnNames: ['idempotencyKey'],
            isUnique: true,
          },
          {
            name: 'IDX_EXAM_PATIENT_ID',
            columnNames: ['patientId'],
          },
          {
            name: 'IDX_EXAM_DATE',
            columnNames: ['examDate'],
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'exams',
      new TableForeignKey({
        columnNames: ['patientId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'patients',
        onDelete: 'CASCADE',
        name: 'FK_EXAM_PATIENT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('exams', 'FK_EXAM_PATIENT');
    await queryRunner.dropTable('exams');
  }
}