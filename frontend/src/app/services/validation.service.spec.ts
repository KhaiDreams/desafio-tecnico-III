import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CPF Validation', () => {
    it('should validate valid CPF', () => {
      expect(service.validateCpf('11144477735')).toBeTruthy();
      expect(service.validateCpf('111.444.777-35')).toBeTruthy();
    });

    it('should invalidate invalid CPF', () => {
      expect(service.validateCpf('12345678901')).toBeFalsy();
      expect(service.validateCpf('111.111.111-11')).toBeFalsy();
      expect(service.validateCpf('123')).toBeFalsy();
      expect(service.validateCpf('')).toBeFalsy();
      expect(service.validateCpf('abc')).toBeFalsy();
    });

    it('should mask CPF correctly', () => {
      expect(service.maskCpf('11144477735')).toBe('111.444.777-35');
      expect(service.maskCpf('123456789')).toBe('123.456.789');
      expect(service.maskCpf('')).toBe('');
    });

    it('should unmask CPF correctly', () => {
      expect(service.unmaskCpf('111.444.777-35')).toBe('11144477735');
      expect(service.unmaskCpf('11144477735')).toBe('11144477735');
      expect(service.unmaskCpf('')).toBe('');
    });
  });

  describe('Phone Validation', () => {
    it('should mask phone correctly', () => {
      expect(service.maskPhone('11999887766')).toBe('(11) 99988-7766');
      expect(service.maskPhone('1133334444')).toBe('(11) 3333-4444');
      expect(service.maskPhone('')).toBe('');
    });

    it('should unmask phone correctly', () => {
      expect(service.unmaskPhone('(11) 99988-7766')).toBe('11999887766');
      expect(service.unmaskPhone('11999887766')).toBe('11999887766');
      expect(service.unmaskPhone('')).toBe('');
    });
  });

  describe('Email Validation', () => {
    it('should validate valid email', () => {
      expect(service.validateEmail('test@email.com')).toBeTruthy();
      expect(service.validateEmail('user.name@domain.co.uk')).toBeTruthy();
    });

    it('should invalidate invalid email', () => {
      expect(service.validateEmail('invalid')).toBeFalsy();
      expect(service.validateEmail('invalid@')).toBeFalsy();
      expect(service.validateEmail('@domain.com')).toBeFalsy();
      expect(service.validateEmail('')).toBeFalsy();
    });
  });

  describe('Birth Date Validation', () => {
    it('should validate valid birth date', () => {
      const validDate = new Date('1990-01-01');
      expect(service.validateBirthDate(validDate)).toBeTruthy();
      expect(service.validateBirthDate('1990-01-01')).toBeTruthy();
    });

    it('should invalidate future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(service.validateBirthDate(futureDate)).toBeFalsy();
    });

    it('should invalidate very old date', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 151);
      expect(service.validateBirthDate(oldDate)).toBeFalsy();
    });

    it('should invalidate invalid date', () => {
      expect(service.validateBirthDate('invalid')).toBeFalsy();
      expect(service.validateBirthDate('')).toBeFalsy();
    });

    it('should calculate age correctly', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      expect(service.calculateAge(birthDate)).toBe(25);
      
      expect(service.calculateAge('')).toBe(0);
    });

    it('should format date to Brazilian format', () => {
      expect(service.formatDateBR('2023-01-15')).toBe('15/01/2023');
      expect(service.formatDateBR(new Date('2023-01-15'))).toBe('15/01/2023');
      expect(service.formatDateBR('')).toBe('');
      expect(service.formatDateBR('invalid')).toBe('');
    });
  });

  describe('Idempotency Key Generation', () => {
    it('should generate unique idempotency keys', () => {
      const key1 = service.generateIdempotencyKey();
      const key2 = service.generateIdempotencyKey();
      
      expect(key1).not.toBe(key2);
      expect(key1).toContain('exam-');
      expect(key2).toContain('exam-');
    });

    it('should generate idempotency key with custom prefix', () => {
      const key = service.generateIdempotencyKey('test');
      expect(key).toContain('test-');
    });
  });
});