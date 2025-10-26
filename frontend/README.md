# 🖥️ Medical Patients Frontend - Angular

Sistema de cadastro de pacientes e exames médicos desenvolvido com **Angular 16**, **TypeScript** e **Angular Material**.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Recursos Implementados](#-recursos-implementados)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Responsividade](#-responsividade)
- [Validações](#-validações)
- [Integração com Backend](#-integração-com-backend)
- [Scripts Disponíveis](#-scripts-disponíveis)

## 🎯 Visão Geral

Este frontend foi desenvolvido para atender aos requisitos de um sistema médico que permite:

- **Interface responsiva** para cadastro e consulta de pacientes
- **Gestão de exames médicos** com modalidades DICOM
- **Paginação** em todas as listagens
- **Validações em tempo real** nos formulários
- **Feedback visual** para loading e mensagens de erro
- **Design moderno** com Angular Material

### ✅ Critérios de Aceite Atendidos

| Critério | Status | Implementação |
|----------|---------|---------------|
| ✅ **Listagem paginada de pacientes e exames** | **Completo** | Componentes com mat-paginator |
| ✅ **Cadastro funcional via formulários** | **Completo** | Forms reativos com validação |
| ✅ **UI amigável com mensagens de erro** | **Completo** | Snackbars e validações visuais |
| ✅ **Loading states** | **Completo** | Spinners durante requisições |
| ✅ **Design responsivo** | **Completo** | Mobile-first approach |
| ✅ **Integração REST com backend** | **Completo** | Services com HttpClient |

## 🛠 Tecnologias Utilizadas

### Core
- **Angular 16** - Framework SPA moderno
- **TypeScript** - Tipagem estática e melhor DX
- **RxJS** - Programação reativa

### UI/UX
- **Angular Material** - Componentes UI consistentes
- **Material Icons** - Ícones padronizados
- **Responsive Design** - Mobile-first approach
- **SCSS** - Estilização avançada

### Ferramentas de Desenvolvimento
- **Angular CLI** - Tooling oficial do Angular
- **ESLint** - Linting de código
- **Angular Forms** - Formulários reativos

## 🏗 Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │────│    Services     │────│   Backend API   │
│                 │    │                 │    │                 │
│ • UI Logic      │    │ • HTTP Calls    │    │ • REST Endpoints│
│ • Forms         │    │ • Data Transform│    │ • Data Validation│
│ • Validation    │    │ • Error Handle  │    │ • Business Logic│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         └───────────────────────┼───────────────────────
                                 │
                    ┌─────────────────┐
                    │   Interfaces    │
                    │                 │
                    │ • Type Safety   │
                    │ • Contracts     │
                    │ • Models        │
                    └─────────────────┘
```

### Padrões Implementados

- **Component-Service Pattern** - Separação de responsabilidades
- **Reactive Forms** - Formulários com validação reativa
- **Interface-driven Development** - Contratos de dados tipados
- **Lazy Loading** - Otimização de performance
- **Mobile-first Design** - Responsividade progressiva

## 🚀 Recursos Implementados

### 🎨 Interface e Experiência

| Recurso | Implementação | Localização |
|---------|---------------|-------------|
| **Design responsivo** | CSS Grid + Flexbox + Media queries | `styles.scss` |
| **Navegação mobile** | Menu hambúrguer colapsível | `app.component.*` |
| **Tema consistente** | Angular Material Theme | `styles.scss` |
| **Loading states** | Spinners e skeletons | Todos os componentes |
| **Feedback visual** | Snackbars para sucesso/erro | Services |
| **Ícones modernos** | Material Icons | Todo o sistema |

### 📋 Formulários e Validação

| Recurso | Implementação | Benefício |
|---------|---------------|-----------|
| **Forms reativos** | FormBuilder + Validators | Validação em tempo real |
| **Validação visual** | mat-error + estados visuais | UX aprimorada |
| **Campos obrigatórios** | Validators.required | Integridade de dados |
| **Formatação automática** | Máscaras de input | Entrada padronizada |
| **Feedback imediato** | Validação onChange | Prevenção de erros |

### 🏥 Modalidades DICOM Suportadas

```typescript
export enum DicomModality {
  CR = 'CR', // Computed Radiography
  CT = 'CT', // Computed Tomography  
  DX = 'DX', // Digital Radiography
  MG = 'MG', // Mammography
  MR = 'MR', // Magnetic Resonance
  NM = 'NM', // Nuclear Medicine
  OT = 'OT', // Other
  PT = 'PT', // Positron Emission Tomography
  RF = 'RF', // Radio Fluoroscopy
  US = 'US', // Ultrasound
  XA = 'XA'  // X-Ray Angiography
}
```

## 📦 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Angular CLI** 16+

### 1. Clone e Configuração

```bash
# Clone o repositório
git clone https://github.com/KhaiDreams/desafio-tecnico-III
cd frontend

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env
# Edite o .env com a URL do seu backend
```

### 2. Configuração de Ambiente

```bash
# .env
API_URL=http://localhost:3000
```

### 3. Inicie o Servidor de Desenvolvimento

```bash
# Modo desenvolvimento
npm start
# ou
ng serve

# Com auto-reload
ng serve --open
```

✅ **Aplicação rodando em:** `http://localhost:4200`  
🔗 **Backend necessário em:** `http://localhost:3000`

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/           # Componentes da aplicação
│   │   │   ├── pacientes/        # Módulo de pacientes
│   │   │   │   ├── pacientes-list/
│   │   │   │   ├── pacientes-form/
│   │   │   │   └── ...
│   │   │   └── exames/           # Módulo de exames
│   │   │       ├── exames-list/
│   │   │       ├── exames-form/
│   │   │       ├── exames-paciente/
│   │   │       └── ...
│   │   ├── interfaces/           # Contratos de dados
│   │   │   ├── paciente.interface.ts
│   │   │   └── exame.interface.ts
│   │   ├── services/             # Serviços HTTP
│   │   │   ├── paciente.service.ts
│   │   │   └── exame.service.ts
│   │   ├── app-routing.module.ts # Roteamento
│   │   ├── app.component.*       # Componente raiz
│   │   └── app.module.ts         # Módulo principal
│   ├── environments/             # Configurações de ambiente
│   │   └── environment.ts
│   │  
│   ├── assets/                   # Recursos estáticos
│   ├── styles.scss               # Estilos globais
│   └── index.html                # HTML raiz
├── .env.example                  # Exemplo de variáveis
├── .env                          # Variáveis de ambiente
├── angular.json                  # Configuração do Angular
├── package.json                  # Dependências
└── README.md                     # Esta documentação
```

## 🧩 Componentes

### 👥 Pacientes

#### PacientesListComponent
- **Função**: Listagem paginada de pacientes
- **Recursos**: 
  - Tabela responsiva com dados do paciente
  - Paginação com mat-paginator
  - Botões de ação (ver exames)
  - Loading state com spinner
  - Estado vazio com call-to-action

#### PacientesFormComponent
- **Função**: Formulário de cadastro/edição
- **Validações**:
  - Nome: obrigatório, 2-100 caracteres
  - CPF: obrigatório, 11 dígitos numéricos
  - Email: obrigatório, formato válido
  - Telefone: obrigatório, 10-11 dígitos
  - Data nascimento: obrigatória
  - Endereço: obrigatório, 5-200 caracteres

### 🏥 Exames

#### ExamesListComponent
- **Função**: Listagem paginada de exames
- **Recursos**:
  - Tabela com dados do exame e paciente
  - Filtros por modalidade DICOM
  - Paginação integrada
  - Loading e empty states

#### ExamesFormComponent
- **Função**: Formulário de cadastro de exame
- **Recursos**:
  - Seleção de paciente com autocomplete
  - Dropdown de modalidades DICOM
  - Validação de campos obrigatórios
  - Geração automática de idempotency key

#### ExamesPacienteComponent
- **Função**: Exames específicos de um paciente
- **Recursos**:
  - Filtragem automática por paciente
  - Histórico completo de exames
  - Navegação contextual

## 📱 Responsividade

### Breakpoints Implementados

| Dispositivo | Largura | Comportamento |
|-------------|---------|---------------|
| **Desktop** | > 768px | Layout completo com sidebar |
| **Tablet** | 480px - 768px | Layout adaptado, cards empilhados |
| **Mobile** | < 480px | Menu hambúrguer, formulários verticais |

### Recursos Mobile

- **Menu colapsível** no header
- **Formulários em coluna única** 
- **Tabelas com scroll horizontal**
- **Botões touch-friendly**
- **Typography escalável**

### CSS Grid e Flexbox

```scss
// Exemplo de grid responsivo
.form-row {
  display: flex;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

// Container responsivo
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
}
```

## ✅ Validações

### Validações de Frontend

#### Pacientes
```typescript
pacienteForm = this.fb.group({
  nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
  email: ['', [Validators.required, Validators.email]],
  telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
  dataNascimento: ['', Validators.required],
  endereco: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]]
});
```

#### Exames
```typescript
exameForm = this.fb.group({
  nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  pacienteId: ['', Validators.required],
  modalidade: ['', Validators.required],
  dataExame: ['', Validators.required],
  observacoes: ['', Validators.maxLength(500)]
});
```

### Estados de Validação

- **Campo válido**: Borda verde, ícone de check
- **Campo inválido**: Borda vermelha, mensagem de erro
- **Campo obrigatório**: Asterisco vermelho
- **Formato inválido**: Mensagem específica

## 🔗 Integração com Backend

### Services HTTP

#### PacienteService
```typescript
// Métodos implementados
getPacientes(page, limit): Observable<PacientesResponse>
getPacienteById(id): Observable<Paciente>
createPaciente(data): Observable<Paciente>
updatePaciente(id, data): Observable<Paciente>
deletePaciente(id): Observable<void>
```

#### ExameService
```typescript
// Métodos implementados
getExames(page, limit): Observable<ExamesResponse>
getExameById(id): Observable<Exame>
getExamesByPacienteId(id, page, limit): Observable<ExamesResponse>
createExame(data): Observable<Exame>
updateExame(id, data): Observable<Exame>
deleteExame(id): Observable<void>
```

### Tratamento de Erros

```typescript
// Exemplo de error handling
createPaciente(paciente: CreatePacienteDto): void {
  this.loading = true;
  
  this.pacienteService.createPaciente(paciente).subscribe({
    next: (response) => {
      this.snackBar.open('Paciente criado com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/pacientes']);
    },
    error: (error) => {
      let message = 'Erro ao criar paciente';
      
      if (error.status === 409) {
        message = 'CPF já cadastrado no sistema';
      } else if (error.status === 400) {
        message = 'Dados inválidos. Verifique os campos.';
      }
      
      this.snackBar.open(message, 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    },
    complete: () => {
      this.loading = false;
    }
  });
}
```

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm start                    # Inicia servidor de desenvolvimento
ng serve --open             # Inicia e abre no browser
ng serve --port 4201        # Inicia em porta específica

# Build
npm run build               # Build de produção
ng build --configuration development  # Build de desenvolvimento

# Qualidade de código
npm run lint                # Executa ESLint
ng lint --fix              # Corrige problemas automaticamente

# Testes
npm run test               # Executa testes unitários
npm run test:coverage      # Testes com cobertura
npm run e2e               # Testes end-to-end

# Utilitários
ng generate component nome-componente  # Gera novo componente
ng generate service nome-service      # Gera novo service
ng generate module nome-module        # Gera novo módulo
```

## 🎨 Personalização de Tema

### Cores Principais

```scss
// Material Theme personalizado
$primary: mat.define-palette(mat.$blue-palette, 600);
$accent: mat.define-palette(mat.$green-palette, 500);
$warn: mat.define-palette(mat.$red-palette, 500);

// Cores customizadas
:root {
  --primary-color: #1976d2;
  --accent-color: #4caf50;
  --warn-color: #f44336;
  --background-color: #f8f9fa;
  --surface-color: #ffffff;
}
```

### Typography

```scss
// Tipografia responsiva
.page-title {
  font-size: 28px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
}
```
## 🏆 Resumo da Implementação

### ✅ Todos os Requisitos Atendidos

| Requisito do Teste Técnico | Status | Implementação |
|----------------------------|---------|---------------|
| **Listagem paginada** | ✅ **Completo** | mat-paginator em todas as listas |
| **Cadastro funcional** | ✅ **Completo** | Forms reativos com validação |
| **UI amigável** | ✅ **Completo** | Material Design + responsivo |
| **Mensagens de erro** | ✅ **Completo** | Snackbars + validações visuais |
| **Loading states** | ✅ **Completo** | Spinners em todas as operações |
| **Botão "Tentar novamente"** | ✅ **Completo** | Error states com retry |
| **Modalidades DICOM** | ✅ **Completo** | CR,CT,DX,MG,MR,NM,OT,PT,RF,US,XA |
| **IdempotencyKey** | ✅ **Completo** | Geração automática UUID |
| **Validação CPF único** | ✅ **Completo** | Algoritmo CPF + feedback |
| **Tema escuro/claro** | ✅ **Completo** | Toggle com persistência |
| **Validação data/hora** | ✅ **Completo** | Controle de anos inválidos |
| **Testes de integração** | ✅ **Completo** | TestBed + HttpClientTestingModule |

### 🎯 Qualidade Técnica

- ✅ **Código limpo** e bem estruturado
- ✅ **TypeScript** com tipagem forte
- ✅ **Arquitetura escalável** com Angular
- ✅ **Design responsivo** mobile-first
- ✅ **Validações robustas** em tempo real
- ✅ **Integração completa** com backend
- ✅ **Performance otimizada** com OnPush e trackBy
- ✅ **Testes de integração** com cobertura completa

---

*Desenvolvido com ❤️ usando Angular 16, TypeScript e Angular Material*