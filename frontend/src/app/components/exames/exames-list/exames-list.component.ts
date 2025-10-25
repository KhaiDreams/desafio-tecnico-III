import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Exame, MODALIDADES_DICOM_LABELS } from '../../../interfaces/exame.interface';
import { ExameService } from '../../../services/exame.service';

@Component({
  selector: 'app-exames-list',
  templateUrl: './exames-list.component.html',
  styleUrls: ['./exames-list.component.scss']
})
export class ExamesListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'name', 'examDate', 'modality', 'patient', 'actions'];
  dataSource = new MatTableDataSource<Exame>();
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  hasError = false;
  modalidadesLabels = MODALIDADES_DICOM_LABELS;

  constructor(
    private exameService: ExameService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExames();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage;
      this.paginator.pageSize = this.pageSize;
    }
  }

  loadExames(): void {
    this.loading = true;
    this.hasError = false;
    
    this.exameService.getExames(this.currentPage + 1, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.loading = false;
        this.hasError = false;
        
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageIndex = this.currentPage;
          this.paginator.pageSize = this.pageSize;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar exames:', error);
        this.loading = false;
        this.hasError = true;
        this.dataSource.data = [];
        this.totalItems = 0;
        this.showError('Erro ao carregar exames. Verifique a conexão e tente novamente.');
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExames();
  }

  retryLoad(): void {
    this.hasError = false;
    this.loadExames();
  }

  navigateToCreate(): void {
    this.router.navigate(['/exames/novo']);
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

  viewPacienteExames(exame: Exame): void {
    this.router.navigate(['/pacientes', exame.patientId, 'exames']);
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