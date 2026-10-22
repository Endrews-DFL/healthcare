# Healthcare App — Architecture Decision Record

## 1. Visão Geral

Patient Portal / Health Insurance Member Portal inspirado no SulAmérica Saúde e nos mockups de referência. Aplicativo web responsivo (Mobile First) que permite pacientes gerenciarem consultas, exames, receitas e informações do plano de saúde.

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 15.5.28 (App Router) | SSR, routing file-based, Server Components; manutenção de segurança |
| Linguagem | TypeScript (strict) | Type safety, DX |
| Estilização | Tailwind CSS 3.4 | Utility-first, design tokens |
| Componentes | shadcn/ui | Headless, acessível, customizável |
| Ícones | Lucide React | Consistente, leve |
| Animações | Framer Motion | Declarativa, performática |
| Backend/DB | Supabase (PostgreSQL) | Auth, DB, Storage, Realtime |
| State | React Context + Zustand (se necessário) | Simples, escalável |
| Forms | React Hook Form + Zod | Validação type-safe |
| Package Manager | pnpm | Rápido, eficiente em disco |

## 3. Estrutura de Diretórios

```
c:\healthcare/
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route group: login, registro
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (portal)/           # Route group: área logada
│   │   │   ├── layout.tsx      # Shell com bottom nav
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   └── new/
│   │   │   ├── doctors/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── exams/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── prescriptions/
│   │   │   ├── card/
│   │   │   ├── profile/
│   │   │   └── notifications/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing / redirect
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Shell, BottomNav, Header, Sidebar
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── appointments/       # Appointment cards, calendar
│   │   ├── doctors/            # Doctor cards, search
│   │   ├── exams/              # Exam results, charts
│   │   ├── prescriptions/      # Prescription cards
│   │   └── shared/             # StatusBadge, Avatar, EmptyState, LoadingState
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── middleware.ts   # Auth middleware
│   │   ├── utils.ts            # cn() helper, formatters
│   │   └── constants.ts        # App constants
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types/interfaces
│   │   ├── database.ts         # Supabase generated types
│   │   ├── appointments.ts
│   │   ├── doctors.ts
│   │   └── user.ts
│   ├── data/                   # Mock data for prototyping
│   │   ├── doctors.ts
│   │   ├── appointments.ts
│   │   ├── exams.ts
│   │   ├── prescriptions.ts
│   │   └── user.ts
│   └── styles/
│       └── design-tokens.ts    # Color palette, spacing, typography
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.local.example
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── package.json
├── ARCHITECTURE.md
└── TASKS.md
```

## 4. Design System

### 4.1 Paleta de Cores

```
Primary:    Blue   #2563EB (blue-600) / #3B82F6 (blue-500)
Secondary:  Green  #10B981 (emerald-500) / #059669 (emerald-600)
Accent:     Teal   #14B8A6 (teal-500)
Background: White  #FFFFFF / #F8FAFC (slate-50)
Surface:    Gray   #F1F5F9 (slate-100)
Text:       Dark   #0F172A (slate-900)
Text Muted: Gray   #64748B (slate-500)
Danger:     Red    #EF4444 (red-500)
Warning:    Amber  #F59E0B (amber-500)
Success:    Green  #22C55E (green-500)
```

### 4.2 Tipografia

- Font: Inter (Google Fonts)
- Headings: font-bold, tracking-tight
- Body: font-normal, text-sm/text-base
- Caption: text-xs, text-slate-500

### 4.3 Espaçamento e Layout

- Border radius: rounded-xl (cards), rounded-2xl (hero cards), rounded-full (avatars/badges)
- Shadows: shadow-sm (cards), shadow-md (elevated), shadow-lg (modals)
- Padding: p-4 (cards), p-6 (sections)
- Gap: gap-3 (card lists), gap-4 (sections)
- Max width: max-w-md (mobile container)

### 4.4 Componentes Core

| Componente | Descrição |
|-----------|-----------|
| BottomNav | Navegação inferior com 4-5 itens + indicador ativo |
| HeroCard | Card grande azul (gradient) para próxima consulta |
| ServiceCard | Card de serviço com ícone e contagem |
| DoctorCard | Avatar + nome + especialidade + rating + horários |
| AppointmentCard | Data/hora + médico + status + ações |
| ExamResultCard | Nome do exame + valor + indicador de range |
| PrescriptionCard | Medicamento + dosagem + status |
| DigitalCard | Carteirinha digital com dados do beneficiário |
| WeekCalendar | Calendário semanal horizontal com dia ativo |
| StatusBadge | Badge colorido (Pending/Confirmed/Completed/Cancelled) |
| EmptyState | Ilustração + mensagem quando lista vazia |
| LoadingState | Skeleton loader para cada tipo de card |

## 5. Modelo de Dados (Inicial)

```
users
  id: uuid (PK)
  email: text
  full_name: text
  cpf: text (encrypted)
  date_of_birth: date
  phone: text
  avatar_url: text
  plan_name: text
  plan_number: text
  plan_valid_until: date
  created_at: timestamptz
  updated_at: timestamptz

doctors
  id: uuid (PK)
  full_name: text
  specialty: text
  crm: text
  avatar_url: text
  rating: decimal
  reviews_count: int
  experience_years: int
  price_per_session: decimal
  bio: text
  available_online: boolean
  available_in_person: boolean
  created_at: timestamptz

doctor_availability
  id: uuid (PK)
  doctor_id: uuid (FK -> doctors)
  day_of_week: int (0-6)
  start_time: time
  end_time: time
  slot_duration_minutes: int

appointments
  id: uuid (PK)
  user_id: uuid (FK -> users)
  doctor_id: uuid (FK -> doctors)
  scheduled_at: timestamptz
  duration_minutes: int
  status: text (scheduled/confirmed/completed/cancelled/no_show)
  type: text (in_person/telemedicine)
  notes: text
  created_at: timestamptz
  updated_at: timestamptz

exams
  id: uuid (PK)
  user_id: uuid (FK -> users)
  name: text
  category: text
  lab_name: text
  performed_at: date
  result_value: text
  unit: text
  reference_range: text
  status: text (pending/available/viewed)
  pdf_url: text
  created_at: timestamptz

prescriptions
  id: uuid (PK)
  user_id: uuid (FK -> users)
  doctor_id: uuid (FK -> doctors)
  appointment_id: uuid (FK -> appointments)
  medication_name: text
  dosage: text
  frequency: text
  duration: text
  notes: text
  prescribed_at: date
  status: text (active/completed/cancelled)
  created_at: timestamptz

notifications
  id: uuid (PK)
  user_id: uuid (FK -> users)
  title: text
  message: text
  type: text (appointment/exam/prescription/general)
  read: boolean
  action_url: text
  created_at: timestamptz
```

## 6. Segurança

- RLS (Row Level Security) no Supabase: cada paciente acessa apenas seus próprios dados
- Autenticação via Supabase Auth (email/password, magic link)
- Campos sensíveis (CPF) nunca expostos em logs ou responses completas
- Dados fictícios durante prototipação
- Sem integrações médicas reais sem autorização
- HTTPS obrigatório em produção
- Rate limiting via Supabase

## 7. Decisões Arquiteturais

### ADR-001: App Router com Route Groups
- **Decisão**: Usar route groups `(auth)` e `(portal)` para separar layouts
- **Razão**: Permite layouts diferentes (sem nav para auth, com bottom nav para portal)

### ADR-002: Mock Data First
- **Decisão**: Iniciar com dados fictícios em `src/data/` antes de integrar Supabase
- **Razão**: Permite desenvolvimento rápido do protótipo visual sem dependência de backend

### ADR-003: Mobile First com Container
- **Decisão**: Usar max-w-md centralizado para simular experiência mobile em desktop
- **Razão**: Foco na experiência mobile conforme mockups, com adaptação responsiva

### ADR-004: Server Components por padrão
- **Decisão**: Usar Server Components exceto onde interatividade é necessária
- **Razão**: Performance, menor bundle JS, SEO

### ADR-005: Supabase SSR, RLS e Storage privado
- **Decisão**: Usar `@supabase/ssr` com cookies para Auth em App Router, handlers de API como fronteira de validação/autorização, e políticas RLS por `auth.uid()` para registros do paciente.
- **Razão**: A identidade deve permanecer consistente entre middleware, componentes e Route Handlers; políticas no banco continuam protegendo dados mesmo se uma rota for chamada diretamente.
- **Storage**: Laudos ficam no bucket privado `medical-reports`, sob o prefixo do usuário. A API valida MIME, extensão, assinatura PDF e tamanho (10 MB) antes de enviar; leitura usa URL assinada de curta duração.
- **Desenvolvimento**: Migrations e seed fictício ficam em `supabase/`. Não há cliente service-role no browser nem configuração de projeto hospedado no repositório.
- **Fallback**: Sem URL e publishable key, o portal permanece em modo de demonstração e as APIs de backend respondem `503`.

### ADR-006: Linha Next.js corrigida de segurança
- **Decisão**: Atualizar Next.js 14.2.15 para 15.5.28 e React para 19.3.1 durante a Sprint 2.
- **Razão**: A linha 14 não recebe mais correções e o aviso oficial de 14/10/2026 recomenda Next 15.5.28 ou 16.4.1 para vulnerabilidades críticas/altas. Mantivemos a menor linha corrigida, evitando uma migração para Next 16 neste ciclo.
