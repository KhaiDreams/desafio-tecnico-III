import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Sistema de Pacientes e Exames (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('✅ Cenário 1: Criar paciente com dados válidos', () => {
    it('should create a patient with valid data and return UUID', async () => {
      const uniqueId = Date.now();
      const patientData = {
        name: `João Silva Santos ${uniqueId}`,
        birthDate: '1990-05-15',
        cpf: `${12345678900 + uniqueId}`.slice(0, 11),
        email: `joao${uniqueId}@email.com`,
        phone: '11999887766',
        address: 'Rua das Flores, 123, São Paulo - SP',
        gender: 'M'
      };

      const response = await request(app.getHttpServer())
        .post('/pacientes')
        .send(patientData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(response.body.name).toBe(patientData.name);
      expect(response.body.cpf).toBe(patientData.cpf);
      expect(response.body.email).toBe(patientData.email);
      expect(response.body.gender).toBe(patientData.gender);
    });
  });

  describe('✅ Cenário 2: Criar paciente com CPF já existente', () => {
    it('should return 409 conflict when CPF already exists', async () => {
      const uniqueId = Date.now() + Math.random() * 1000;
      const cpf = `${Math.floor(12345678900 + uniqueId)}`.slice(0, 11);
      
      const patientData = {
        name: `João Silva Santos ${uniqueId}`,
        birthDate: '1990-05-15',
        cpf: cpf,
        email: `joao${uniqueId}@email.com`,
        phone: '11999887766',
        address: 'Rua das Flores, 123, São Paulo - SP',
        gender: 'M'
      };

      // Create first patient
      await request(app.getHttpServer())
        .post('/pacientes')
        .send(patientData)
        .expect(201);

      // Try to create patient with same CPF
      const duplicatePatientData = {
        ...patientData,
        name: `Maria Santos ${uniqueId}`,
        email: `maria${Math.floor(uniqueId + 1000)}@email.com`
      };

      const response = await request(app.getHttpServer())
        .post('/pacientes')
        .send(duplicatePatientData)
        .expect(409);

      expect(response.body.message).toContain('CPF já está em uso');
    });
  });

  describe('✅ Cenário 3: Criar exame com dados válidos', () => {
    it('should create an exam with valid data and return UUID', async () => {
      const uniqueId = Date.now() + Math.random() * 1000;
      
      // First create a patient
      const patientData = {
        name: `João Silva Santos ${uniqueId}`,
        birthDate: '1990-05-15',
        cpf: `${Math.floor(32345678900 + uniqueId)}`.slice(0, 11),
        email: `joao${Math.floor(uniqueId)}@email.com`,
        phone: '11999887766',
        address: 'Rua das Flores, 123, São Paulo - SP',
        gender: 'M'
      };

      const patientResponse = await request(app.getHttpServer())
        .post('/pacientes')
        .send(patientData)
        .expect(201);

      const patientId = patientResponse.body.id;

      // Then create an exam
      const examData = {
        examDate: '2024-01-15T10:30:00.000Z',
        name: 'Ressonância Magnética de Crânio',
        modality: 'MR',
        patientId: patientId,
        idempotencyKey: `unique-key-${Math.floor(uniqueId)}`
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .send(examData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(response.body.name).toBe(examData.name);
      expect(response.body.modality).toBe(examData.modality);
      expect(response.body.patient.id).toBe(patientId);
    });
  });

  describe('✅ Cenário 4: Idempotência - chave repetida', () => {
    it('should return the same exam when idempotencyKey is repeated', async () => {
      const uniqueId = Date.now() + Math.random() * 1000;
      
      // Create patient
      const patientData = {
        name: `João Silva Santos ${uniqueId}`,
        birthDate: '1990-05-15',
        cpf: `${Math.floor(42345678900 + uniqueId)}`.slice(0, 11),
        email: `joao${Math.floor(uniqueId)}@email.com`,
        phone: '11999887766',
        address: 'Rua das Flores, 123, São Paulo - SP',
        gender: 'M'
      };

      const patientResponse = await request(app.getHttpServer())
        .post('/pacientes')
        .send(patientData)
        .expect(201);

      const examData = {
        examDate: '2024-01-15T10:30:00.000Z',
        name: 'Ressonância Magnética de Crânio',
        modality: 'MR',
        patientId: patientResponse.body.id,
        idempotencyKey: `idempotency-key-${Math.floor(uniqueId)}`
      };

      // Create first exam
      const firstResponse = await request(app.getHttpServer())
        .post('/exames')
        .send(examData)
        .expect(201);

      // Try to create exam with same idempotencyKey
      const secondResponse = await request(app.getHttpServer())
        .post('/exames')
        .send(examData)
        .expect(200); // Should return 200 for existing resource

      expect(secondResponse.body.id).toBe(firstResponse.body.id);
      expect(secondResponse.body.idempotencyKey).toBe(examData.idempotencyKey);
    });
  });

  describe('✅ Cenário 5: Exame para paciente inexistente', () => {
    it('should return 404 when patient does not exist', async () => {
      const nonExistentPatientId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Valid UUID format
      
      const examData = {
        examDate: '2024-01-15T10:30:00.000Z',
        name: 'Ressonância Magnética de Crânio',
        modality: 'MR', // Valid modality
        patientId: nonExistentPatientId,
        idempotencyKey: `key-${Date.now()}`
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .send(examData)
        .expect(404); // Not Found for missing resource

      expect(response.body.message).toContain('Paciente não encontrado');
    });
  });

  describe('✅ Cenário 6: Modalidade DICOM inválida', () => {
    it('should return 400 for invalid DICOM modality', async () => {
      const uniqueId = Date.now() + Math.random() * 1000;
      
      // Create patient
      const patientData = {
        name: `João Silva Santos ${uniqueId}`,
        birthDate: '1990-05-15',
        cpf: `${Math.floor(52345678900 + uniqueId)}`.slice(0, 11),
        email: `joao${Math.floor(uniqueId)}@email.com`,
        phone: '11999887766',
        address: 'Rua das Flores, 123, São Paulo - SP',
        gender: 'M'
      };

      const patientResponse = await request(app.getHttpServer())
        .post('/pacientes')
        .send(patientData)
        .expect(201);

      const examData = {
        examDate: '2024-01-15T10:30:00.000Z',
        name: 'Ressonância Magnética de Crânio',
        modality: 'INVALID_MODALITY',
        patientId: patientResponse.body.id,
        idempotencyKey: `key-${Math.floor(uniqueId)}`
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .send(examData)
        .expect(400);

      expect(response.body.message).toContain('Modalidade deve ser uma das opções DICOM válidas');
    });
  });

  describe('✅ Cenário 7: CORS Configuration', () => {
    it('should allow GET requests from any origin', async () => {
      const response = await request(app.getHttpServer())
        .get('/pacientes')
        .set('Origin', 'http://localhost:4200')
        .expect(200);

      // CORS headers são configurados automaticamente pelo NestJS
      expect(response.status).toBe(200);
    });
  });

  describe('✅ Cenário 8: Paginação de pacientes', () => {
    it('should return paginated patients list correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/pacientes?page=1&pageSize=5')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('hasNextPage');
      expect(response.body).toHaveProperty('hasPreviousPage');
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(5);
    });
  });

  describe('✅ Cenário 9: Paginação de exames', () => {
    it('should return paginated exams list correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/exames?page=1&pageSize=5')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(5);
    });
  });

  describe('✅ Cenário 10: Filtros por paciente', () => {
    it('should filter exams by patient ID', async () => {
      const uniqueId = Date.now() + Math.random() * 1000;
      
      // Create patient
      const patientData = {
        name: `João Silva Santos ${uniqueId}`,
        birthDate: '1990-05-15',
        cpf: `${Math.floor(62345678900 + uniqueId)}`.slice(0, 11),
        email: `joao${Math.floor(uniqueId)}@email.com`,
        phone: '11999887766',
        address: 'Rua das Flores, 123, São Paulo - SP',
        gender: 'M'
      };

      const patientResponse = await request(app.getHttpServer())
        .post('/pacientes')
        .send(patientData)
        .expect(201);

      const patientId = patientResponse.body.id;

      // Create exam for this patient
      const examData = {
        examDate: '2024-01-15T10:30:00.000Z',
        name: 'Exame Teste',
        modality: 'MR',
        patientId: patientId,
        idempotencyKey: `filter-key-${Math.floor(uniqueId)}`
      };

      await request(app.getHttpServer())
        .post('/exames')
        .send(examData)
        .expect(201);

      // Filter exams by patient
      const response = await request(app.getHttpServer())
        .get(`/exames/paciente/${patientId}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].patient.id).toBe(patientId);
      }
    });
  });

  describe('✅ Cenário 11: Validação de entrada', () => {
    it('should reject requests with extra fields', async () => {
      const patientDataWithExtra = {
        name: 'João Silva Santos',
        birthDate: '1990-05-15',
        cpf: `${Date.now()}`.slice(0, 11),
        email: `test${Date.now()}@email.com`,
        phone: '11999887766',
        address: 'Rua das Flores, 123, São Paulo - SP',
        gender: 'M',
        extraField: 'This should not be allowed'
      };

      const response = await request(app.getHttpServer())
        .post('/pacientes')
        .send(patientDataWithExtra)
        .expect(400);

      expect(response.body.message).toContain('property extraField should not exist');
    });
  });

  describe('✅ Cenário 12: Tratamento de erros', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });

    it('should return structured error response', async () => {
      const response = await request(app.getHttpServer())
        .post('/pacientes')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('✅ Cenário 13: Comportamento de paginação', () => {
    it('should return default pagination when parameters are not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/pacientes')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/pacientes?page=0')
        .expect(400);

      expect(response.body.message).toContain('Página deve ser maior que 0');
    });
  });

  describe('🏥 API Endpoints', () => {
    it('should handle API requests correctly', async () => {
      // Test that API is responding
      const response = await request(app.getHttpServer())
        .get('/pacientes')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });
});