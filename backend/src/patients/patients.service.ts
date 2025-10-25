import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      // Check if CPF already exists
      const existingPatientByCpf = await this.patientsRepository.findOne({
        where: { cpf: createPatientDto.cpf },
      });

      if (existingPatientByCpf) {
        throw new ConflictException('CPF já está em uso por outro paciente');
      }

      // Check if email already exists
      const existingPatientByEmail = await this.patientsRepository.findOne({
        where: { email: createPatientDto.email },
      });

      if (existingPatientByEmail) {
        throw new ConflictException('Email já está em uso por outro paciente');
      }

      // Create new patient
      const patient = this.patientsRepository.create({
        ...createPatientDto,
        birthDate: new Date(createPatientDto.birthDate),
      });

      return await this.patientsRepository.save(patient);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Erro ao criar paciente: dados duplicados');
    }
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<Patient>> {
    const { page = 1, pageSize = 10 } = paginationQuery;
    const skip = (page - 1) * pageSize;

    const [patients, total] = await this.patientsRepository.findAndCount({
      skip,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
    });

    return new PaginatedResponseDto(patients, total, page, pageSize);
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['exams'],
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return patient;
  }

  async findByCpf(cpf: string): Promise<Patient | null> {
    return await this.patientsRepository.findOne({
      where: { cpf },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.patientsRepository.count({
      where: { id },
    });
    return count > 0;
  }
}