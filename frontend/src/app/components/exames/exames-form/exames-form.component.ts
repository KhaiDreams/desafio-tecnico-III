import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ExameService } from '../../../services/exame.service';
import { PacienteService } from '../../../services/paciente.service';
import { ValidationService } from '../../../services/validation.service';
import { CreateExameDto, DicomModality, MODALIDADES_DICOM_LABELS } from '../../../interfaces/exame.interface';
import { Paciente } from '../../../interfaces/paciente.interface';

@Component({
  selector: 'app-exames-form',
  templateUrl: './exames-form.component.html',
  styleUrls: ['./exames-form.component.scss']
})
export class ExamesFormComponent implements OnInit {
  exameForm!: FormGroup;
  loading = false;
  pacientes: Paciente[] = [];
  modalidades = Object.values(DicomModality);
  modalidadesLabels = MODALIDADES_DICOM_LABELS;
  filteredPacientes!: Observable<Paciente[]>;
  selectedPatient: Paciente | null = null;
  patientSearchControl = new FormControl('');
  currentYear = new Date().getFullYear();
  minDate = `${this.currentYear - 1}-01-01T00:00`;
  maxDate = `${this.currentYear + 2}-12-31T23:59`;
  statusOptions = [
    { value: 'AGENDADO', label: 'Agendado' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDO', label: 'Concluído' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private exameService: ExameService,
    private pacienteService: PacienteService,
    private validationService: ValidationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPacientes();
  }

  private initForm(): void {
    this.exameForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(255)
      ]],
      examDate: ['', [Validators.required, this.dateValidator.bind(this)]],
      modality: ['', [Validators.required]],
      patientId: ['', [Validators.required]],
      observations: ['', [Validators.maxLength(1000)]],
      status: ['AGENDADO'] // Default status
    });

    // Configurar filtro de pacientes
    this.filteredPacientes = this.patientSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPacientes(value || ''))
    );
  }

  private dateValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const now = new Date();
    const minYear = this.currentYear - 1;
    const maxYear = this.currentYear + 2;

    // Verificar se é uma data válida
    if (isNaN(selectedDate.getTime())) {
      return { invalidDate: true };
    }

    // Verificar se o ano está no range válido
    if (selectedDate.getFullYear() < minYear || selectedDate.getFullYear() > maxYear) {
      return { invalidDate: true };
    }

    // Verificar se não é no passado (permitir hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setSeconds(0, 0);
    
    if (selectedDate < today) {
      return { pastDate: true };
    }

    return null;
  }

  private loadPacientes(): void {
    this.pacienteService.getPacientes(1, 100).subscribe({
      next: (response) => {
        this.pacientes = response.data;
      },
      error: (error) => {
        console.error('Erro ao carregar pacientes:', error);
        this.showError('Erro ao carregar pacientes.');
      }
    });
  }

  private _filterPacientes(value: string): Paciente[] {
    if (!value) {
      return this.pacientes;
    }
    
    const filterValue = value.toLowerCase();
    return this.pacientes.filter(paciente => 
      paciente.name.toLowerCase().includes(filterValue) ||
      paciente.cpf.includes(filterValue.replace(/\D/g, ''))
    );
  }

  onPatientSelected(event: any): void {
    const paciente = event.option.value; // Agora é o objeto completo
    
    if (paciente && paciente.id) {
      this.selectedPatient = paciente;
      this.exameForm.get('patientId')?.setValue(paciente.id);
      // Manter o nome no campo de busca para mostrar seleção
      this.patientSearchControl.setValue(`${paciente.name} - CPF: ${this.formatCpf(paciente.cpf)}`, { emitEvent: false });
    }
  }

  onPatientInput(event: any): void {
    const value = event.target.value;
    // Se o usuário limpar o campo, resetar seleção
    if (!value) {
      this.selectedPatient = null;
      this.exameForm.get('patientId')?.setValue('');
    }
    // Se o valor mudou e não corresponde ao paciente selecionado, resetar
    else if (this.selectedPatient) {
      const expectedValue = `${this.selectedPatient.name} - CPF: ${this.formatCpf(this.selectedPatient.cpf)}`;
      if (value !== expectedValue) {
        this.selectedPatient = null;
        this.exameForm.get('patientId')?.setValue('');
      }
    }
  }

  // Remover o displayPaciente pois não precisamos mais
  formatCpf(cpf: string): string {
    return this.validationService.maskCpf(cpf);
  }

  clearPatientSelection(): void {
    this.selectedPatient = null;
    this.exameForm.get('patientId')?.setValue('');
    this.patientSearchControl.setValue('');
  }

  onSubmit(): void {
    if (this.exameForm.valid && this.selectedPatient) {
      this.loading = true;
      
      const formData = this.exameForm.value;
      const exameData: CreateExameDto = {
        idempotencyKey: this.validationService.generateIdempotencyKey(),
        name: formData.name.trim(),
        examDate: this.formatDate(formData.examDate),
        modality: formData.modality,
        observations: formData.observations?.trim() || undefined,
        patientId: this.selectedPatient.id!, // Garantir que seja o UUID do paciente
        status: formData.status || 'AGENDADO'
      };

      console.log('Dados do exame a serem enviados:', exameData); // Debug

      this.exameService.createExame(exameData).subscribe({
        next: (exame) => {
          this.loading = false;
          this.showSuccess('Exame cadastrado com sucesso!');
          this.router.navigate(['/exames']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao cadastrar exame:', error);
          
          if (error.status === 400) {
            this.showError('Dados inválidos. Verifique os campos e tente novamente.');
          } else if (error.status === 404) {
            this.showError('Paciente não encontrado.');
          } else {
            this.showError('Erro ao cadastrar exame. Tente novamente.');
          }
        }
      });
    } else {
      if (!this.selectedPatient) {
        this.showError('Por favor, selecione um paciente válido da lista.');
        return;
      }
      this.markFormGroupTouched();
      this.showError('Por favor, corrija os erros no formulário.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/exames']);
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.exameForm.controls).forEach(key => {
      const control = this.exameForm.get(key);
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

  getModalidadeLabel(modalidade: DicomModality): string {
    return this.modalidadesLabels[modalidade as keyof typeof this.modalidadesLabels] || modalidade;
  }

  // Getters para facilitar acesso aos controles no template
  get name() { return this.exameForm.get('name'); }
  get examDate() { return this.exameForm.get('examDate'); }
  get modality() { return this.exameForm.get('modality'); }
  get patientId() { return this.exameForm.get('patientId'); }
  get observations() { return this.exameForm.get('observations'); }
  get status() { return this.exameForm.get('status'); }
}