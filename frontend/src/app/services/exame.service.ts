import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exame, CreateExameDto, ExamesResponse } from '../interfaces/exame.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExameService {
  private apiUrl = `${environment.apiUrl}/exames`;

  constructor(private http: HttpClient) {}

  getExames(page: number = 1, pageSize: number = 10): Observable<ExamesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ExamesResponse>(this.apiUrl, { params });
  }

  getExameById(id: string): Observable<Exame> {
    return this.http.get<Exame>(`${this.apiUrl}/${id}`);
  }

  getExamesByPacienteId(pacienteId: string, page: number = 1, pageSize: number = 10): Observable<ExamesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ExamesResponse>(`${this.apiUrl}/paciente/${pacienteId}`, { params });
  }

  createExame(exame: CreateExameDto): Observable<Exame> {
    return this.http.post<Exame>(this.apiUrl, exame);
  }

  updateExame(id: string, exame: Partial<CreateExameDto>): Observable<Exame> {
    return this.http.put<Exame>(`${this.apiUrl}/${id}`, exame);
  }

  deleteExame(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Gerar chave de idempotência única
  generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}