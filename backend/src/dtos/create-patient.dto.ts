import { IsString, IsEmail, IsNotEmpty, IsDateString, IsEnum, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePatientDto {
  @ApiProperty({ description: 'Nome completo do paciente', example: 'João Silva Santos' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(2, 255, { message: 'Nome deve ter entre 2 e 255 caracteres' })
  name!: string;

  @ApiProperty({ description: 'Data de nascimento (YYYY-MM-DD)', example: '1990-05-15' })
  @IsDateString({}, { message: 'Data de nascimento deve estar no formato YYYY-MM-DD' })
  birthDate!: string;

  @ApiProperty({ description: 'CPF (apenas números)', example: '12345678901' })
  @IsString()
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter apenas números' })
  @Transform(({ value }) => value?.replace(/\D/g, '')) // Remove non-digits
  cpf!: string;

  @ApiProperty({ description: 'Email do paciente', example: 'joao@email.com' })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @ApiProperty({ description: 'Telefone do paciente', example: '11999887766' })
  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Length(10, 20, { message: 'Telefone deve ter entre 10 e 20 caracteres' })
  phone!: string;

  @ApiProperty({ description: 'Endereço completo', example: 'Rua das Flores, 123, São Paulo - SP' })
  @IsString()
  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  @Length(5, 500, { message: 'Endereço deve ter entre 5 e 500 caracteres' })
  address!: string;

  @ApiProperty({ description: 'Gênero do paciente', enum: ['M', 'F', 'O'], example: 'M' })
  @IsEnum(['M', 'F', 'O'], { message: 'Gênero deve ser M (Masculino), F (Feminino) ou O (Outro)' })
  gender!: 'M' | 'F' | 'O';
}