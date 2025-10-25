import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Valida CPF
   * @param cpf CPF para validar (pode conter pontos e traços)
   * @returns true se válido, false se inválido
   */
  validateCpf(cpf: string): boolean {
    if (!cpf) return false;
    
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  /**
   * Aplica máscara de CPF
   * @param cpf CPF sem formatação
   * @returns CPF formatado (000.000.000-00)
   */
  maskCpf(cpf: string): string {
    if (!cpf) return '';
    
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Aplica a máscara
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    return cpf;
  }

  /**
   * Remove máscara do CPF (deixa apenas números)
   * @param cpf CPF com ou sem máscara
   * @returns CPF apenas com números
   */
  unmaskCpf(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '');
  }

  /**
   * Aplica máscara de telefone
   * @param phone Telefone sem formatação
   * @returns Telefone formatado
   */
  maskPhone(phone: string): string {
    if (!phone) return '';
    
    // Remove caracteres não numéricos
    phone = phone.replace(/\D/g, '');
    
    if (phone.length === 11) {
      // Celular: (00) 00000-0000
      phone = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      // Fixo: (00) 0000-0000
      phone = phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  /**
   * Remove máscara do telefone
   * @param phone Telefone com ou sem máscara
   * @returns Telefone apenas com números
   */
  unmaskPhone(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  /**
   * Valida email
   * @param email Email para validar
   * @returns true se válido, false se inválido
   */
  validateEmail(email: string): boolean {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida data de nascimento
   * @param birthDate Data de nascimento
   * @returns true se válida, false se inválida
   */
  validateBirthDate(birthDate: string | Date): boolean {
    if (!birthDate) return false;
    
    const date = new Date(birthDate);
    const now = new Date();
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return false;
    
    // Verifica se não é uma data futura
    if (date > now) return false;
    
    // Verifica se a pessoa não tem mais de 150 anos
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 150);
    if (date < maxAge) return false;
    
    return true;
  }

  /**
   * Calcula idade a partir da data de nascimento
   * @param birthDate Data de nascimento
   * @returns Idade em anos
   */
  calculateAge(birthDate: string | Date): number {
    if (!birthDate) return 0;
    
    const birth = new Date(birthDate);
    const now = new Date();
    
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Formata data para o padrão brasileiro
   * @param date Data
   * @returns Data formatada (DD/MM/AAAA)
   */
  formatDateBR(date: string | Date): string {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Gera uma chave de idempotência única
   * @param prefix Prefixo opcional
   * @returns Chave de idempotência
   */
  generateIdempotencyKey(prefix: string = 'exam'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${timestamp}-${random}`;
  }
}