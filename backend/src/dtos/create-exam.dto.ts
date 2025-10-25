import { IsString, IsNotEmpty, IsDateString, IsEnum, IsUUID, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DicomModality } from '../entities/dicom-modality.enum';

export class CreateExamDto {
  @ApiProperty({ description: 'Chave de idempotência única', example: 'exam-123-456-789' })
  @IsString()
  @IsNotEmpty({ message: 'Chave de idempotência é obrigatória' })
  @Length(1, 255, { message: 'Chave de idempotência deve ter entre 1 e 255 caracteres' })
  idempotencyKey!: string;

  @ApiProperty({ description: 'Nome/descrição do exame', example: 'Tomografia de Tórax' })
  @IsString()
  @IsNotEmpty({ message: 'Nome do exame é obrigatório' })
  @Length(2, 255, { message: 'Nome do exame deve ter entre 2 e 255 caracteres' })
  name!: string;

  @ApiProperty({ description: 'Data e hora do exame (ISO 8601)', example: '2023-10-25T14:30:00Z' })
  @IsDateString({}, { message: 'Data do exame deve estar no formato ISO 8601' })
  examDate!: string;

  @ApiProperty({ 
    description: 'Modalidade DICOM do exame', 
    enum: DicomModality,
    example: DicomModality.CT 
  })
  @IsEnum(DicomModality, { message: 'Modalidade deve ser uma das opções DICOM válidas' })
  modality!: DicomModality;

  @ApiPropertyOptional({ description: 'Observações sobre o exame', example: 'Exame com contraste' })
  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Observações devem ter no máximo 1000 caracteres' })
  observations?: string;

  @ApiProperty({ description: 'ID do paciente (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4', { message: 'ID do paciente deve ser um UUID válido' })
  patientId!: string;

  @ApiPropertyOptional({ 
    description: 'Status do exame', 
    enum: ['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'],
    example: 'AGENDADO'
  })
  @IsOptional()
  @IsEnum(['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'], {
    message: 'Status deve ser AGENDADO, EM_ANDAMENTO, CONCLUIDO ou CANCELADO'
  })
  status?: 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
}