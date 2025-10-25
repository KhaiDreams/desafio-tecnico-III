import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    // Carregar tema salvo do localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setDarkMode(savedTheme === 'dark');
    } else {
      // Verificar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }
    
    // Aplicar imediatamente no HTML para evitar flash
    this.applyThemeToHtml(this.isDarkMode.value);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.next(isDark);
    
    // Salvar no localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Aplicar classe no body e html
    this.applyThemeToHtml(isDark);
  }

  private applyThemeToHtml(isDark: boolean): void {
    // Remover classes de loading
    document.documentElement.classList.remove('dark-loading');
    document.body.classList.remove('dark-loading');
    
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.documentElement.style.backgroundColor = '#121212';
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#e0e0e0';
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.style.backgroundColor = '#f8f9fa';
      document.body.style.backgroundColor = '#f8f9fa';
      document.body.style.color = '';
    }
  }

  toggleTheme(): void {
    this.setDarkMode(!this.isDarkMode.value);
  }

  getCurrentTheme(): boolean {
    return this.isDarkMode.value;
  }
}