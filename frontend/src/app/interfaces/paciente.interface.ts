export interface Paciente {
  id?: string;
  name: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  gender: 'M' | 'F' | 'O';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePacienteDto {
  name: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  gender: 'M' | 'F' | 'O';
}

export interface PacientesResponse {
  data: Paciente[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}