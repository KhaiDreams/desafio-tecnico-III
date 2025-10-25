import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PacienteService } from './paciente.service';
import { Paciente, CreatePacienteDto, PacientesResponse } from '../interfaces/paciente.interface';
import { environment } from '../../environments/environment';

describe('PacienteService Integration Tests', () => {
  let service: PacienteService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/pacientes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PacienteService]
    });
    service = TestBed.inject(PacienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPacientes', () => {
    it('should fetch pacientes with pagination', () => {
      const mockResponse: PacientesResponse = {
        data: [
          {
            id: '1',
            name: 'João Silva',
            cpf: '11144477735',
            email: 'joao@email.com',
            phone: '11999887766',
            birthDate: '1990-01-01',
            address: 'Rua das Flores, 123',
            gender: 'M'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };

      service.getPacientes(1, 10).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.length).toBe(1);
        expect(response.total).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockResponse);
    });

    it('should handle empty response', () => {
      const mockResponse: PacientesResponse = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };

      service.getPacientes().subscribe(response => {
        expect(response.data.length).toBe(0);
        expect(response.total).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPacienteById', () => {
    it('should fetch single paciente', () => {
      const mockPaciente: Paciente = {
        id: '1',
        name: 'João Silva',
        cpf: '11144477735',
        email: 'joao@email.com',
        phone: '11999887766',
        birthDate: '1990-01-01',
        address: 'Rua das Flores, 123',
        gender: 'M'
      };

      service.getPacienteById('1').subscribe(paciente => {
        expect(paciente).toEqual(mockPaciente);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaciente);
    });
  });

  describe('createPaciente', () => {
    it('should create paciente successfully', () => {
      const createDto: CreatePacienteDto = {
        name: 'João Silva',
        cpf: '11144477735',
        email: 'joao@email.com',
        phone: '11999887766',
        birthDate: '1990-01-01',
        address: 'Rua das Flores, 123',
        gender: 'M'
      };

      const mockPaciente: Paciente = {
        id: '1',
        ...createDto
      };

      service.createPaciente(createDto).subscribe(paciente => {
        expect(paciente).toEqual(mockPaciente);
        expect(paciente.id).toBeDefined();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockPaciente);
    });

    it('should handle validation errors (400)', () => {
      const createDto: CreatePacienteDto = {
        name: 'A', // Too short
        cpf: '123', // Invalid
        email: 'invalid-email',
        phone: '123',
        birthDate: '',
        address: '',
        gender: 'M'
      };

      service.createPaciente(createDto).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle duplicate CPF/email errors (409)', () => {
      const createDto: CreatePacienteDto = {
        name: 'João Silva',
        cpf: '11144477735',
        email: 'joao@email.com',
        phone: '11999887766',
        birthDate: '1990-01-01',
        address: 'Rua das Flores, 123',
        gender: 'M'
      };

      service.createPaciente(createDto).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'CPF or email already exists' }, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('updatePaciente', () => {
    it('should update paciente successfully', () => {
      const updateData = { name: 'João Silva Santos' };
      const mockPaciente: Paciente = {
        id: '1',
        name: 'João Silva Santos',
        cpf: '11144477735',
        email: 'joao@email.com',
        phone: '11999887766',
        birthDate: '1990-01-01',
        address: 'Rua das Flores, 123',
        gender: 'M'
      };

      service.updatePaciente('1', updateData).subscribe(paciente => {
        expect(paciente.name).toBe('João Silva Santos');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockPaciente);
    });
  });

  describe('deletePaciente', () => {
    it('should delete paciente successfully', () => {
      service.deletePaciente('1').subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle not found error (404)', () => {
      service.deletePaciente('999').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush({ message: 'Paciente not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors gracefully', () => {
      service.getPacientes().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=10`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle server errors (500)', () => {
      service.getPacientes().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=10`);
      req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});