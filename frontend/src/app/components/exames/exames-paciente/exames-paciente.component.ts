import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Exame, MODALIDADES_DICOM_LABELS } from '../../../interfaces/exame.interface';
import { Paciente } from '../../../interfaces/paciente.interface';
import { ExameService } from '../../../services/exame.service';
import { PacienteService } from '../../../services/paciente.service';

@Component({
  selector: 'app-exames-paciente',
  templateUrl: './exames-paciente.component.html',
  styleUrls: ['./exames-paciente.component.scss']
})
export class ExamesPacienteComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'name', 'examDate', 'modality', 'actions'];
  dataSource = new MatTableDataSource<Exame>();
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  modalidadesLabels = MODALIDADES_DICOM_LABELS;
  
  pacienteId!: string;
  paciente: Paciente | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exameService: ExameService,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pacienteId = params['id'];
      this.loadPaciente();
      this.loadExames();
    });
  }

  loadPaciente(): void {
    this.pacienteService.getPacienteById(this.pacienteId).subscribe({
      next: (paciente) => {
        this.paciente = paciente;
      },
      error: (error) => {
        console.error('Erro ao carregar paciente:', error);
        this.showError('Paciente não encontrado.');
        this.router.navigate(['/pacientes']);
      }
    });
  }

  loadExames(): void {
    this.loading = true;
    
    this.exameService.getExamesByPacienteId(this.pacienteId, this.currentPage + 1, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar exames:', error);
        this.loading = false;
        this.showError('Erro ao carregar exames. Tente novamente.');
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExames();
  }

  navigateToCreateExame(): void {
    this.router.navigate(['/exames/novo'], { 
      queryParams: { pacienteId: this.pacienteId } 
    });
  }

  backToPacientes(): void {
    this.router.navigate(['/pacientes']);
  }

  editExame(exame: Exame): void {
    // Implementar edição
    this.showInfo('Funcionalidade de edição será implementada em breve');
  }

  deleteExame(exame: Exame): void {
    if (confirm(`Tem certeza que deseja excluir o exame ${exame.name}?`)) {
      this.exameService.deleteExame(exame.id!).subscribe({
        next: () => {
          this.showSuccess('Exame excluído com sucesso');
          this.loadExames();
        },
        error: (error) => {
          console.error('Erro ao excluir exame:', error);
          this.showError('Erro ao excluir exame. Tente novamente.');
        }
      });
    }
  }

  getModalidadeLabel(modalidade: string): string {
    return this.modalidadesLabels[modalidade as keyof typeof this.modalidadesLabels] || modalidade;
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