import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { PacientesListComponent } from './pacientes-list.component';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente, PacientesResponse } from '../../../interfaces/paciente.interface';

describe('PacientesListComponent', () => {
  let component: PacientesListComponent;
  let fixture: ComponentFixture<PacientesListComponent>;
  let pacienteService: jasmine.SpyObj<PacienteService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockPacientes: Paciente[] = [
    {
      id: '1',
      name: 'João Silva',
      cpf: '11144477735',
      email: 'joao@email.com',
      phone: '11999887766',
      birthDate: '1990-01-01',
      address: 'Rua das Flores, 123',
      gender: 'M',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Maria Santos',
      cpf: '22255588899',
      email: 'maria@email.com',
      phone: '11888776655',
      birthDate: '1985-05-15',
      address: 'Av. Brasil, 456',
      gender: 'F',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    }
  ];

  const mockResponse: PacientesResponse = {
    data: mockPacientes,
    total: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };

  beforeEach(async () => {
    const pacienteServiceSpy = jasmine.createSpyObj('PacienteService', ['getPacientes', 'deletePaciente']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [PacientesListComponent],
      imports: [
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PacienteService, useValue: pacienteServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesListComponent);
    component = fixture.componentInstance;
    pacienteService = TestBed.inject(PacienteService) as jasmine.SpyObj<PacienteService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pacientes on init', () => {
    pacienteService.getPacientes.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    
    expect(pacienteService.getPacientes).toHaveBeenCalledWith(1, 10);
    expect(component.dataSource.data).toEqual(mockPacientes);
    expect(component.totalItems).toBe(2);
    expect(component.loading).toBe(false);
    expect(component.hasError).toBe(false);
  });

  it('should handle loading error', () => {
    pacienteService.getPacientes.and.returnValue(throwError({ status: 500 }));
    
    component.loadPacientes();
    
    expect(component.loading).toBe(false);
    expect(component.hasError).toBe(true);
    expect(component.dataSource.data).toEqual([]);
    expect(component.totalItems).toBe(0);
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('should change page correctly', () => {
    pacienteService.getPacientes.and.returnValue(of(mockResponse));
    
    const pageEvent = {
      pageIndex: 1,
      pageSize: 5
    };
    
    component.onPageChange(pageEvent);
    
    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBe(5);
    expect(pacienteService.getPacientes).toHaveBeenCalledWith(2, 5); // page+1 for backend
  });

  it('should navigate to create form', () => {
    component.navigateToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['/pacientes/novo']);
  });

  it('should navigate to paciente exames', () => {
    const paciente = mockPacientes[0];
    component.viewExames(paciente);
    expect(router.navigate).toHaveBeenCalledWith(['/pacientes', paciente.id, 'exames']);
  });

  it('should delete paciente with confirmation', () => {
    const paciente = mockPacientes[0];
    spyOn(window, 'confirm').and.returnValue(true);
    pacienteService.deletePaciente.and.returnValue(of(void 0));
    pacienteService.getPacientes.and.returnValue(of(mockResponse));
    
    expect(window.confirm).toHaveBeenCalled();
    expect(pacienteService.deletePaciente).toHaveBeenCalledWith(paciente.id!);
    expect(snackBar.open).toHaveBeenCalledWith('Paciente excluído com sucesso', 'Fechar', jasmine.any(Object));
  });

  it('should not delete paciente without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(pacienteService.deletePaciente).not.toHaveBeenCalled();
  });

  it('should format CPF correctly', () => {
    const formatted = component.formatCpf('11144477735');
    expect(formatted).toBe('111.444.777-35');
  });

  it('should format phone correctly', () => {
    const cellPhone = component.formatPhone('11999887766');
    expect(cellPhone).toBe('(11) 99988-7766');
    
    const landline = component.formatPhone('1133334444');
    expect(landline).toBe('(11) 3333-4444');
  });

  it('should get gender label correctly', () => {
    expect(component.getGenderLabel('M')).toBe('Masculino');
    expect(component.getGenderLabel('F')).toBe('Feminino');
    expect(component.getGenderLabel('O')).toBe('Outro');
  });

  it('should retry loading after error', () => {
    component.hasError = true;
    pacienteService.getPacientes.and.returnValue(of(mockResponse));
    
    component.retryLoad();
    
    expect(component.hasError).toBe(false);
    expect(pacienteService.getPacientes).toHaveBeenCalled();
  });

  it('should update paginator after view init', () => {
    component.totalItems = 50;
    component.currentPage = 2;
    component.pageSize = 20;
    
    // Mock paginator
    component.paginator = {
      length: 0,
      pageIndex: 0,
      pageSize: 10
    } as any;
    
    component.ngAfterViewInit();
    
    expect(component.paginator.pageIndex).toBe(2);
    expect(component.paginator.pageSize).toBe(20);
  });
});