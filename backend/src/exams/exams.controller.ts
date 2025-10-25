import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from '../dtos/create-exam.dto';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { Exam } from '../entities/exam.entity';

@ApiTags('Exames')
@Controller('exames')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo exame' })
  @ApiResponse({
    status: 201,
    description: 'Exame criado com sucesso',
    type: Exam,
  })
  @ApiResponse({
    status: 200,
    description: 'Exame já existe (idempotência)',
    type: Exam,
  })
  @ApiResponse({
    status: 400,
    description: 'Paciente não encontrado ou dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Erro ao criar exame',
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createExamDto: CreateExamDto,
  ): Promise<Exam> {
    return this.examsService.create(createExamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar exames com paginação' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Tamanho da página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de exames paginada',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Exam>> {
    return this.examsService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar exame por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do exame (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do exame encontrado',
    type: Exam,
  })
  @ApiResponse({
    status: 404,
    description: 'Exame não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Exam> {
    return this.examsService.findOne(id);
  }

  @Get('paciente/:patientId')
  @ApiOperation({ summary: 'Listar exames de um paciente' })
  @ApiParam({
    name: 'patientId',
    description: 'ID do paciente (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Tamanho da página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de exames do paciente',
    type: PaginatedResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query(new ValidationPipe({ transform: true }))
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Exam>> {
    return this.examsService.findByPatient(patientId, paginationQuery);
  }
}