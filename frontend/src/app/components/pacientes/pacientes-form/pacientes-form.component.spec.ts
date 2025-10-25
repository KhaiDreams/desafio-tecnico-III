import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { PacientesFormComponent } from './pacientes-form.component';
import { PacienteService } from '../../../services/paciente.service';
import { ValidationService } from '../../../services/validation.service';

describe('PacientesFormComponent', () => {
  let component: PacientesFormComponent;
  let fixture: ComponentFixture<PacientesFormComponent>;
  let pacienteService: jasmine.SpyObj<PacienteService>;
  let validationService: ValidationService;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const pacienteServiceSpy = jasmine.createSpyObj('PacienteService', ['createPaciente']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [PacientesFormComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PacienteService, useValue: pacienteServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        ValidationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesFormComponent);
    component = fixture.componentInstance;
    pacienteService = TestBed.inject(PacienteService) as jasmine.SpyObj<PacienteService>;
    validationService = TestBed.inject(ValidationService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.pacienteForm).toBeDefined();
    expect(component.pacienteForm.get('name')?.value).toBe('');
    expect(component.pacienteForm.get('cpf')?.value).toBe('');
    expect(component.pacienteForm.get('email')?.value).toBe('');
    expect(component.pacienteForm.get('phone')?.value).toBe('');
    expect(component.pacienteForm.get('birthDate')?.value).toBe('');
    expect(component.pacienteForm.get('address')?.value).toBe('');
    expect(component.pacienteForm.get('gender')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.pacienteForm;
    
    expect(form.valid).toBeFalsy();
    
    // Test required validations
    expect(form.get('name')?.hasError('required')).toBeTruthy();
    expect(form.get('cpf')?.hasError('required')).toBeTruthy();
    expect(form.get('email')?.hasError('required')).toBeTruthy();
    expect(form.get('phone')?.hasError('required')).toBeTruthy();
    expect(form.get('birthDate')?.hasError('required')).toBeTruthy();
    expect(form.get('address')?.hasError('required')).toBeTruthy();
    expect(form.get('gender')?.hasError('required')).toBeTruthy();
  });

  it('should validate CPF correctly', () => {
    const cpfControl = component.pacienteForm.get('cpf');
    
    // Test invalid CPF
    cpfControl?.setValue('12345678901');
    expect(cpfControl?.hasError('cpfInvalid')).toBeTruthy();
    
    // Test valid CPF
    cpfControl?.setValue('11144477735'); // CPF válido para teste
    expect(cpfControl?.hasError('cpfInvalid')).toBeFalsy();
  });

  it('should validate email correctly', () => {
    const emailControl = component.pacienteForm.get('email');
    
    // Test invalid email
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
    
    // Test valid email
    emailControl?.setValue('test@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should validate birth date correctly', () => {
    const birthDateControl = component.pacienteForm.get('birthDate');
    
    // Test future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    birthDateControl?.setValue(futureDate);
    expect(birthDateControl?.hasError('futureDate')).toBeTruthy();
    
    // Test valid date
    const validDate = new Date('1990-01-01');
    birthDateControl?.setValue(validDate);
    expect(birthDateControl?.hasError('futureDate')).toBeFalsy();
    expect(birthDateControl?.hasError('invalidDate')).toBeFalsy();
  });

  it('should submit form with valid data', () => {
    const mockPaciente = {
      id: '123',
      name: 'João Silva',
      cpf: '11144477735',
      email: 'joao@email.com',
      phone: '11999887766',
      birthDate: '1990-01-01',
      address: 'Rua das Flores, 123',
      gender: 'M' as const
    };

    pacienteService.createPaciente.and.returnValue(of(mockPaciente));

    // Fill form with valid data
    component.pacienteForm.patchValue({
      name: 'João Silva',
      cpf: '111.444.777-35',
      email: 'joao@email.com',
      phone: '(11) 99988-7766',
      birthDate: new Date('1990-01-01'),
      address: 'Rua das Flores, 123',
      gender: 'M'
    });

    component.onSubmit();

    expect(pacienteService.createPaciente).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/pacientes']);
  });

  it('should handle submission error', () => {
    pacienteService.createPaciente.and.returnValue(throwError({ status: 409 }));

    // Fill form with valid data
    component.pacienteForm.patchValue({
      name: 'João Silva',
      cpf: '111.444.777-35',
      email: 'joao@email.com',
      phone: '(11) 99988-7766',
      birthDate: new Date('1990-01-01'),
      address: 'Rua das Flores, 123',
      gender: 'M'
    });

    component.onSubmit();

    expect(pacienteService.createPaciente).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'CPF ou email já cadastrado no sistema.',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should apply CPF mask correctly', () => {
    const mockEvent = {
      target: { value: '11144477735' }
    };

    spyOn(validationService, 'maskCpf').and.returnValue('111.444.777-35');
    
    component.onCpfInput(mockEvent);
    
    expect(validationService.maskCpf).toHaveBeenCalledWith('11144477735');
    expect(mockEvent.target.value).toBe('111.444.777-35');
  });

  it('should apply phone mask correctly', () => {
    const mockEvent = {
      target: { value: '11999887766' }
    };

    spyOn(validationService, 'maskPhone').and.returnValue('(11) 99988-7766');
    
    component.onPhoneInput(mockEvent);
    
    expect(validationService.maskPhone).toHaveBeenCalledWith('11999887766');
    expect(mockEvent.target.value).toBe('(11) 99988-7766');
  });

  it('should calculate age correctly', () => {
    component.pacienteForm.get('birthDate')?.setValue(new Date('1990-01-01'));
    
    const age = component.getCurrentAge();
    expect(age).toBeGreaterThan(30); // Considerando que estamos em 2025
  });

  it('should navigate to pacientes list on cancel', () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/pacientes']);
  });
});