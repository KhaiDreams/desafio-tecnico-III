import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Paciente } from '../../../interfaces/paciente.interface';
import { PacienteService } from '../../../services/paciente.service';

@Component({
  selector: 'app-pacientes-list',
  templateUrl: './pacientes-list.component.html',
  styleUrls: ['./pacientes-list.component.scss']
})
export class PacientesListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['name', 'cpf', 'email', 'phone', 'birthDate', 'gender', 'actions'];
  dataSource = new MatTableDataSource<Paciente>();
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  hasError = false;

  constructor(
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPacientes();
  }

  ngAfterViewInit(): void {
    // Configurar o paginator após a view ser inicializada
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage;
      this.paginator.pageSize = this.pageSize;
    }
  }

  loadPacientes(): void {
    this.loading = true;
    this.hasError = false;
    
    this.pacienteService.getPacientes(this.currentPage + 1, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.loading = false;
        this.hasError = false;
        
        // Atualizar o paginator com os novos dados
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageIndex = this.currentPage;
          this.paginator.pageSize = this.pageSize;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar pacientes:', error);
        this.loading = false;
        this.hasError = true;
        this.dataSource.data = [];
        this.totalItems = 0;
        this.showError('Erro ao carregar pacientes. Verifique a conexão e tente novamente.');
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPacientes();
  }

  retryLoad(): void {
    this.hasError = false;
    this.loadPacientes();
  }

  navigateToCreate(): void {
    this.router.navigate(['/pacientes/novo']);
  }

  viewExames(paciente: Paciente): void {
    this.router.navigate(['/pacientes', paciente.id, 'exames']);
  }

  editPaciente(paciente: Paciente): void {
    // Implementar edição
    this.showInfo('Funcionalidade de edição será implementada em breve');
  }

  deletePaciente(paciente: Paciente): void {
    if (confirm(`Tem certeza que deseja excluir o paciente ${paciente.name}?`)) {
      this.pacienteService.deletePaciente(paciente.id!).subscribe({
        next: () => {
          this.showSuccess('Paciente excluído com sucesso');
          this.loadPacientes();
        },
        error: (error) => {
          console.error('Erro ao excluir paciente:', error);
          this.showError('Erro ao excluir paciente. Tente novamente.');
        }
      });
    }
  }

  // Formatação helpers
  formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatPhone(phone: string): string {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
  }

  getGenderLabel(gender: 'M' | 'F' | 'O'): string {
    const labels = {
      'M': 'Masculino',
      'F': 'Feminino',
      'O': 'Outro'
    };
    return labels[gender] || gender;
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

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}