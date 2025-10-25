import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PacienteService } from '../../../services/paciente.service';
import { ValidationService } from '../../../services/validation.service';
import { CreatePacienteDto } from '../../../interfaces/paciente.interface';

@Component({
  selector: 'app-pacientes-form',
  templateUrl: './pacientes-form.component.html',
  styleUrls: ['./pacientes-form.component.scss']
})
export class PacientesFormComponent implements OnInit {
  pacienteForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private validationService: ValidationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.pacienteForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(255)
      ]],
      cpf: ['', [
        Validators.required,
        this.cpfValidator.bind(this)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(255)
      ]],
      phone: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(20)
      ]],
      birthDate: ['', [
        Validators.required,
        this.birthDateValidator.bind(this)
      ]],
      address: ['', [
        Validators.required, 
        Validators.minLength(5),
        Validators.maxLength(500)
      ]],
      gender: ['', [Validators.required]]
    });
  }

  // Validator customizado para CPF
  private cpfValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const cpf = this.validationService.unmaskCpf(control.value);
    if (!this.validationService.validateCpf(cpf)) {
      return { 'cpfInvalid': true };
    }
    return null;
  }

  // Validator customizado para data de nascimento
  private birthDateValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;
    
    if (!this.validationService.validateBirthDate(control.value)) {
      const date = new Date(control.value);
      const now = new Date();
      
      if (date > now) {
        return { 'futureDate': true };
      } else {
        return { 'invalidDate': true };
      }
    }
    return null;
  }

  // Máscara para CPF
  onCpfInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const maskedValue = this.validationService.maskCpf(value);
    input.value = maskedValue;
    this.pacienteForm.get('cpf')?.setValue(maskedValue, { emitEvent: false });
  }

  // Máscara para telefone
  onPhoneInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const maskedValue = this.validationService.maskPhone(value);
    input.value = maskedValue;
    this.pacienteForm.get('phone')?.setValue(maskedValue, { emitEvent: false });
  }

  // Calcula idade ao selecionar data de nascimento
  onBirthDateChange(): void {
    const birthDate = this.pacienteForm.get('birthDate')?.value;
    if (birthDate && this.validationService.validateBirthDate(birthDate)) {
      const age = this.validationService.calculateAge(birthDate);
      // Pode ser usado para exibir a idade na tela se necessário
    }
  }

  // Getter para obter idade atual
  getCurrentAge(): number | null {
    const birthDate = this.pacienteForm.get('birthDate')?.value;
    if (birthDate && this.validationService.validateBirthDate(birthDate)) {
      return this.validationService.calculateAge(birthDate);
    }
    return null;
  }

  onSubmit(): void {
    if (this.pacienteForm.valid) {
      this.loading = true;
      
      const formData = this.pacienteForm.value;
      const pacienteData: CreatePacienteDto = {
        name: formData.name.trim(),
        cpf: this.validationService.unmaskCpf(formData.cpf), // Remove máscara
        email: formData.email.trim().toLowerCase(),
        phone: this.validationService.unmaskPhone(formData.phone), // Remove máscara
        birthDate: this.formatDate(formData.birthDate),
        address: formData.address.trim(),
        gender: formData.gender
      };

      this.pacienteService.createPaciente(pacienteData).subscribe({
        next: (paciente) => {
          this.loading = false;
          this.showSuccess('Paciente cadastrado com sucesso!');
          this.router.navigate(['/pacientes']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao cadastrar paciente:', error);
          
          if (error.status === 409) {
            this.showError('CPF ou email já cadastrado no sistema.');
          } else if (error.status === 400) {
            this.showError('Dados inválidos. Verifique os campos e tente novamente.');
          } else {
            this.showError('Erro ao cadastrar paciente. Tente novamente.');
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      this.showError('Por favor, corrija os erros no formulário.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/pacientes']);
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private markFormGroupTouched(): void {
    Object.keys(this.pacienteForm.controls).forEach(key => {
      const control = this.pacienteForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Getters para facilitar acesso aos controles no template
  get name() { return this.pacienteForm.get('name'); }
  get cpf() { return this.pacienteForm.get('cpf'); }
  get email() { return this.pacienteForm.get('email'); }
  get phone() { return this.pacienteForm.get('phone'); }
  get birthDate() { return this.pacienteForm.get('birthDate'); }
  get address() { return this.pacienteForm.get('address'); }
  get gender() { return this.pacienteForm.get('gender'); }
}