import { 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { Exam } from '../entities/exam.entity';
import { CreateExamDto } from '../dtos/create-exam.dto';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examsRepository: Repository<Exam>,
    private readonly patientsService: PatientsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    // Use transaction to ensure idempotency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if patient exists
      const patientExists = await this.patientsService.exists(createExamDto.patientId);
      if (!patientExists) {
        throw new BadRequestException('Paciente não encontrado');
      }

      // Check for existing exam with same idempotency key
      const existingExam = await queryRunner.manager.findOne(Exam, {
        where: { idempotencyKey: createExamDto.idempotencyKey },
        relations: ['patient'],
      });

      if (existingExam) {
        // Return existing exam (idempotent behavior)
        await queryRunner.commitTransaction();
        return existingExam;
      }

      // Create new exam
      const exam = queryRunner.manager.create(Exam, {
        ...createExamDto,
        examDate: new Date(createExamDto.examDate),
        status: createExamDto.status || 'AGENDADO',
      });

      const savedExam = await queryRunner.manager.save(exam);
      
      // Load with relations
      const examWithRelations = await queryRunner.manager.findOne(Exam, {
        where: { id: savedExam.id },
        relations: ['patient'],
      });

      await queryRunner.commitTransaction();
      return examWithRelations!;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle unique constraint violation
      if ((error as any).code === '23505' && (error as any).constraint?.includes('idempotencyKey')) {
        // Race condition - another request created exam with same key
        const existingExam = await this.examsRepository.findOne({
          where: { idempotencyKey: createExamDto.idempotencyKey },
          relations: ['patient'],
        });
        
        if (existingExam) {
          return existingExam;
        }
      }
      
      throw new ConflictException('Erro ao criar exame');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<Exam>> {
    const { page = 1, pageSize = 10 } = paginationQuery;
    const skip = (page - 1) * pageSize;

    const [exams, total] = await this.examsRepository.findAndCount({
      skip,
      take: pageSize,
      relations: ['patient'],
      order: {
        examDate: 'DESC',
        createdAt: 'DESC',
      },
    });

    return new PaginatedResponseDto(exams, total, page, pageSize);
  }

  async findOne(id: string): Promise<Exam> {
    const exam = await this.examsRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!exam) {
      throw new NotFoundException('Exame não encontrado');
    }

    return exam;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Exam | null> {
    return await this.examsRepository.findOne({
      where: { idempotencyKey },
      relations: ['patient'],
    });
  }

  async findByPatient(patientId: string, paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<Exam>> {
    const { page = 1, pageSize = 10 } = paginationQuery;
    const skip = (page - 1) * pageSize;

    // Verify patient exists
    const patientExists = await this.patientsService.exists(patientId);
    if (!patientExists) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const [exams, total] = await this.examsRepository.findAndCount({
      where: { patientId },
      skip,
      take: pageSize,
      relations: ['patient'],
      order: {
        examDate: 'DESC',
        createdAt: 'DESC',
      },
    });

    return new PaginatedResponseDto(exams, total, page, pageSize);
  }
}