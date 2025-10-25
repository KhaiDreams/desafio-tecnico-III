export interface Exame {
  id?: string;
  idempotencyKey: string;
  name: string;
  examDate: string;
  modality: DicomModality;
  observations?: string;
  status: 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  patientId: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExameDto {
  idempotencyKey: string;
  name: string;
  examDate: string;
  modality: DicomModality;
  observations?: string;
  patientId: string;
  status?: 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
}

export interface ExamesResponse {
  data: Exame[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export enum DicomModality {
  CR = 'CR',
  CT = 'CT',
  DX = 'DX',
  MG = 'MG',
  MR = 'MR',
  NM = 'NM',
  OT = 'OT',
  PT = 'PT',
  RF = 'RF',
  US = 'US',
  XA = 'XA'
}

export const MODALIDADES_DICOM_LABELS = {
  [DicomModality.CR]: 'Radiografia Computadorizada',
  [DicomModality.CT]: 'Tomografia Computadorizada',
  [DicomModality.DX]: 'Radiografia Digital',
  [DicomModality.MG]: 'Mamografia',
  [DicomModality.MR]: 'Ressonância Magnética',
  [DicomModality.NM]: 'Medicina Nuclear',
  [DicomModality.OT]: 'Outros',
  [DicomModality.PT]: 'Tomografia por Emissão de Pósitrons',
  [DicomModality.RF]: 'Radiofluoroscopia',
  [DicomModality.US]: 'Ultrassonografia',
  [DicomModality.XA]: 'Angiografia por Raio-X'
};