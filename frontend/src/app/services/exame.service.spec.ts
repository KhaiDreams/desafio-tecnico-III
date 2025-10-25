import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExameService } from './exame.service';
import { Exame, CreateExameDto, ExamesResponse, DicomModality } from '../interfaces/exame.interface';
import { environment } from '../../environments/environment';

describe('ExameService Integration Tests', () => {
  let service: ExameService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/exames`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExameService]
    });
    service = TestBed.inject(ExameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getExames', () => {
    it('should fetch exames with pagination', () => {
      const mockResponse: ExamesResponse = {
        data: [
          {
            id: '1',
            idempotencyKey: 'exam_12345',
            name: 'Tomografia de Tórax',
            examDate: '2025-11-01T10:00:00Z',
            modality: DicomModality.CT,
            observations: 'Exame de rotina',
            status: 'AGENDADO',
            patientId: 'patient-1',
            patient: {
              id: 'patient-1',
              name: 'João Silva',
              cpf: '11144477735'
            }
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };

      service.getExames(1, 10).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.length).toBe(1);
        expect(response.data[0].modality).toBe(DicomModality.CT);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createExame', () => {
    it('should create exame with unique idempotencyKey', () => {
      const createDto: CreateExameDto = {
        idempotencyKey: 'exam_unique_12345',
        name: 'Ressonância Magnética',
        examDate: '2025-11-02T14:00:00Z',
        modality: DicomModality.MR,
        observations: 'Paciente com dor nas costas',
        patientId: 'patient-1',
        status: 'AGENDADO'
      };

      const mockExame: Exame = {
        id: '2',
        idempotencyKey: createDto.idempotencyKey,
        name: createDto.name,
        examDate: createDto.examDate,
        modality: createDto.modality,
        observations: createDto.observations,
        status: createDto.status || 'AGENDADO',
        patientId: createDto.patientId,
        patient: {
          id: 'patient-1',
          name: 'João Silva',
          cpf: '11144477735'
        },
        createdAt: '2025-10-25T10:00:00Z',
        updatedAt: '2025-10-25T10:00:00Z'
      };

      service.createExame(createDto).subscribe(exame => {
        expect(exame.id).toBeDefined();
        expect(exame.idempotencyKey).toBe('exam_unique_12345');
        expect(exame.modality).toBe(DicomModality.MR);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockExame);
    });

    it('should handle idempotency - return existing exame for duplicate key', () => {
      const createDto: CreateExameDto = {
        idempotencyKey: 'exam_duplicate_12345',
        name: 'Ultrassom',
        examDate: '2025-11-03T09:00:00Z',
        modality: DicomModality.US,
        patientId: 'patient-1',
        status: 'AGENDADO'
      };

      const existingExame: Exame = {
        id: '3',
        idempotencyKey: createDto.idempotencyKey,
        name: createDto.name,
        examDate: createDto.examDate,
        modality: createDto.modality,
        status: createDto.status || 'AGENDADO',
        patientId: createDto.patientId,
        patient: {
          id: 'patient-1',
          name: 'João Silva',
          cpf: '11144477735'
        },
        createdAt: '2025-10-25T08:00:00Z',
        updatedAt: '2025-10-25T08:00:00Z'
      };

      // First request - creates exame
      service.createExame(createDto).subscribe(exame => {
        expect(exame.id).toBe('3');
      });

      const req1 = httpMock.expectOne(apiUrl);
      expect(req1.request.method).toBe('POST');
      req1.flush(existingExame, { status: 201, statusText: 'Created' });

      // Second request with same idempotencyKey - returns existing
      service.createExame(createDto).subscribe(exame => {
        expect(exame.id).toBe('3');
        expect(exame.idempotencyKey).toBe('exam_duplicate_12345');
      });

      const req2 = httpMock.expectOne(apiUrl);
      expect(req2.request.method).toBe('POST');
      // Backend returns 200 with existing exame for idempotent request
      req2.flush(existingExame, { status: 200, statusText: 'OK' });
    });

    it('should handle patient not found error (400)', () => {
      const createDto: CreateExameDto = {
        idempotencyKey: 'exam_nonexistent_patient',
        name: 'Raio-X',
        examDate: '2025-11-04T16:00:00Z',
        modality: DicomModality.DX,
        patientId: 'nonexistent-patient-id',
        status: 'AGENDADO'
      };

      service.createExame(createDto).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Patient not found' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should validate DICOM modality enum', () => {
      const createDto: CreateExameDto = {
        idempotencyKey: 'exam_invalid_modality',
        name: 'Exame Inválido',
        examDate: '2025-11-05T11:00:00Z',
        modality: 'INVALID' as DicomModality, // Invalid modality
        patientId: 'patient-1',
        status: 'AGENDADO'
      };

      service.createExame(createDto).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Invalid DICOM modality' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('DICOM Modalities Coverage', () => {
    it('should support all required DICOM modalities', () => {
      const requiredModalities = ['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'];
      
      requiredModalities.forEach(modality => {
        expect(Object.values(DicomModality)).toContain(modality as DicomModality);
      });
    });
  });

  describe('Concurrent Requests Simulation', () => {
    it('should handle multiple simultaneous requests with same idempotencyKey', () => {
      const idempotencyKey = 'exam_concurrent_test';
      const createDto: CreateExameDto = {
        idempotencyKey,
        name: 'Exame Simultâneo',
        examDate: '2025-11-08T12:00:00Z',
        modality: DicomModality.CT,
        patientId: 'patient-1',
        status: 'AGENDADO'
      };

      const mockExame: Exame = {
        id: 'concurrent-1',
        idempotencyKey: createDto.idempotencyKey,
        name: createDto.name,
        examDate: createDto.examDate,
        modality: createDto.modality,
        status: createDto.status || 'AGENDADO',
        patientId: createDto.patientId
      };

      // Simulate 3 concurrent requests
      const request1 = service.createExame(createDto);
      const request2 = service.createExame(createDto);
      const request3 = service.createExame(createDto);

      // All should get the same result
      request1.subscribe(exame => expect(exame.id).toBe('concurrent-1'));
      request2.subscribe(exame => expect(exame.id).toBe('concurrent-1'));
      request3.subscribe(exame => expect(exame.id).toBe('concurrent-1'));

      // Handle the HTTP requests
      const reqs = httpMock.match(apiUrl);
      expect(reqs.length).toBe(3);
      
      // First request creates (201)
      reqs[0].flush(mockExame, { status: 201, statusText: 'Created' });
      // Second and third return existing (200) 
      reqs[1].flush(mockExame, { status: 200, statusText: 'OK' });
      reqs[2].flush(mockExame, { status: 200, statusText: 'OK' });
    });
  });
});