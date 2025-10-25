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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { Patient } from '../entities/patient.entity';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente criado com sucesso',
    type: Patient,
  })
  @ApiResponse({
    status: 409,
    description: 'CPF ou email já existe',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPatientDto: CreatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pacientes com paginação' })
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
    description: 'Lista de pacientes paginada',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Patient>> {
    return this.patientsService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do paciente (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do paciente encontrado',
    type: Patient,
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Patient> {
    return this.patientsService.findOne(id);
  }
}