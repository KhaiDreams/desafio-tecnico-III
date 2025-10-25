import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from './patient.entity';
import { DicomModality } from './dicom-modality.enum';

@Entity('exams')
@Unique(['idempotencyKey']) // Garantir idempotência
export class Exam {
  @ApiProperty({ description: 'ID único do exame' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Chave de idempotência para evitar duplicatas' })
  @Column({ length: 255, unique: true })
  idempotencyKey!: string;

  @ApiProperty({ description: 'Nome/descrição do exame' })
  @Column({ length: 255 })
  name!: string;

  @ApiProperty({ description: 'Data e hora do exame' })
  @Column({ type: 'timestamp' })
  examDate!: Date;

  @ApiProperty({ description: 'Modalidade DICOM do exame' })
  @Column({
    type: 'enum',
    enum: DicomModality,
  })
  modality!: DicomModality;

  @ApiProperty({ description: 'Observações sobre o exame' })
  @Column({ type: 'text', nullable: true })
  observations?: string;

  @ApiProperty({ description: 'Status do exame' })
  @Column({
    type: 'enum',
    enum: ['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'],
    default: 'AGENDADO'
  })
  status!: 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

  @ApiProperty({ description: 'ID do paciente' })
  @Column('uuid')
  patientId!: string;

  @ApiProperty({ description: 'Paciente associado ao exame' })
  @ManyToOne(() => Patient, patient => patient.exams, { 
    onDelete: 'CASCADE',
    eager: true 
  })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Data de atualização do registro' })
  @UpdateDateColumn()
  updatedAt!: Date;
}