import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exam } from './exam.entity';

@Entity('patients')
export class Patient {
  @ApiProperty({ description: 'ID único do paciente' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Nome completo do paciente' })
  @Column({ length: 255 })
  name!: string;

  @ApiProperty({ description: 'Data de nascimento' })
  @Column({ type: 'date' })
  birthDate!: Date;

  @ApiProperty({ description: 'CPF do paciente' })
  @Column({ length: 11, unique: true })
  cpf!: string;

  @ApiProperty({ description: 'Email do paciente' })
  @Column({ length: 255, unique: true })
  email!: string;

  @ApiProperty({ description: 'Telefone do paciente' })
  @Column({ length: 20 })
  phone!: string;

  @ApiProperty({ description: 'Endereço completo' })
  @Column({ type: 'text' })
  address!: string;

  @ApiProperty({ description: 'Gênero do paciente' })
  @Column({ 
    type: 'enum', 
    enum: ['M', 'F', 'O'],
    comment: 'M = Masculino, F = Feminino, O = Outro'
  })
  gender!: 'M' | 'F' | 'O';

  @ApiHideProperty() // Esconder do Swagger para evitar dependência circular
  @OneToMany(() => Exam, (exam: Exam) => exam.patient)
  exams!: Exam[];

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Data de atualização do registro' })
  @UpdateDateColumn()
  updatedAt!: Date;
}