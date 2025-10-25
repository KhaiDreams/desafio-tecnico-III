import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PacientesListComponent } from './components/pacientes/pacientes-list/pacientes-list.component';
import { PacientesFormComponent } from './components/pacientes/pacientes-form/pacientes-form.component';
import { ExamesListComponent } from './components/exames/exames-list/exames-list.component';
import { ExamesFormComponent } from './components/exames/exames-form/exames-form.component';
import { ExamesPacienteComponent } from './components/exames/exames-paciente/exames-paciente.component';

const routes: Routes = [
  { path: '', redirectTo: '/pacientes', pathMatch: 'full' },
  { path: 'pacientes', component: PacientesListComponent },
  { path: 'pacientes/novo', component: PacientesFormComponent },
  { path: 'exames', component: ExamesListComponent },
  { path: 'exames/novo', component: ExamesFormComponent },
  { path: 'pacientes/:id/exames', component: ExamesPacienteComponent },
  { path: '**', redirectTo: '/pacientes' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }