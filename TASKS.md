# Healthcare App — Task Backlog

## Legenda de Status
- 🔲 Planejada
- 🔄 Em Andamento
- ✅ Concluída
- 🔁 Em Revisão
- ❌ Bloqueada

---

## Sprint 1 — Fundação e Protótipo Visual

### TASK-001: Scaffolding do Projeto
- **Responsável**: Sonnet
- **Dependências**: Nenhuma
- **Status**: ✅ Concluída
- **Objetivo**: Criar o projeto Next.js com todas as dependências configuradas
- **Critérios de Aceite**:
  - [x] Next.js 14 com App Router inicializado
  - [x] TypeScript strict configurado
  - [x] Tailwind CSS configurado com design tokens
  - [x] shadcn/ui inicializado com componentes base
  - [x] Lucide Icons instalado
  - [x] Framer Motion instalado
  - [x] Estrutura de diretórios conforme ARCHITECTURE.md
  - [x] Font Inter configurada
  - [x] `pnpm dev` funciona sem erros

### TASK-002: Design System e Componentes Base
- **Responsável**: Sonnet
- **Dependências**: TASK-001
- **Status**: ✅ Concluída
- **Objetivo**: Criar os componentes reutilizáveis do design system
- **Critérios de Aceite**:
  - [x] Design tokens definidos (cores, tipografia, espaçamento)
  - [x] BottomNav component com 5 itens (Home, Services, Appointments, Exams, Profile)
  - [x] Header component com avatar e notificação
  - [x] StatusBadge component com variantes (pending, confirmed, completed, cancelled)
  - [x] EmptyState component
  - [x] LoadingState/Skeleton component
  - [x] Todos os componentes responsivos

### TASK-003: Dados Fictícios (Mock Data)
- **Responsável**: Sonnet
- **Dependências**: TASK-001
- **Status**: ✅ Concluída
- **Objetivo**: Criar base de dados fictícios para o protótipo
- **Critérios de Aceite**:
  - [x] Mock de usuário com dados do plano
  - [x] 10+ médicos com diferentes especialidades
  - [x] 8+ consultas (passadas e futuras, diferentes status)
  - [x] 6+ resultados de exames
  - [x] 5+ prescrições
  - [x] 5+ notificações
  - [x] Tipos TypeScript para cada entidade

### TASK-004: Layout Shell (Portal)
- **Responsável**: Sonnet
- **Dependências**: TASK-002
- **Status**: ✅ Concluída
- **Objetivo**: Criar o layout principal da área logada
- **Critérios de Aceite**:
  - [x] Layout com BottomNav fixo na parte inferior
  - [x] Header com avatar e notificações
  - [x] Área de conteúdo com scroll
  - [x] Safe area para notch/bottom bar
  - [x] Transições suaves entre páginas
  - [x] Responsivo: sidebar em desktop, bottom nav em mobile

### TASK-005: Dashboard Page
- **Responsável**: Sonnet
- **Dependências**: TASK-003, TASK-004
- **Status**: ✅ Concluída
- **Objetivo**: Implementar a tela principal do paciente
- **Critérios de Aceite**:
  - [x] Saudação personalizada com avatar e nome
  - [x] Toggle Online/Offline (telemedicina/presencial)
  - [x] Seção "Serviços" com cards horizontais (Consultas, Exames, Receitas, Carteirinha)
  - [x] Calendário semanal horizontal com dia atual destacado
  - [x] Seção "Próxima Consulta" com HeroCard azul
  - [x] Seção "Médicos Populares" com cards horizontais
  - [x] Animações de entrada (fade + slide up)
  - [x] Estados de loading skeleton

### TASK-006: Appointments Page
- **Responsável**: Sonnet
- **Dependências**: TASK-003, TASK-004
- **Status**: ✅ Concluída
- **Objetivo**: Tela de consultas com calendário e listagem
- **Critérios de Aceite**:
  - [x] Header "Appointments" com navegação
  - [x] Seção "Upcoming" com HeroCard da próxima consulta
  - [x] Botões "Pay now" e "Reschedule"
  - [x] Seção "Appointment History" com lista de consultas passadas
  - [x] Cards com avatar do médico, especialidade, data e valor
  - [x] StatusBadge (Pending/Confirmed/Completed/Cancelled)
  - [x] Calendário mensal/semanal com navegação

### TASK-007: Doctors Page
- **Responsável**: Sonnet
- **Dependências**: TASK-003, TASK-004
- **Status**: ✅ Concluída
- **Objetivo**: Busca e listagem de médicos
- **Critérios de Aceite**:
  - [x] Barra de busca
  - [x] Filtros por especialidade (chips/tags)
  - [x] Grid de médicos populares com avatar, nome, rating
  - [x] Cards com botão favoritar
  - [x] Link para página de detalhe

### TASK-008: Doctor Detail Page
- **Responsável**: Sonnet
- **Dependências**: TASK-007
- **Status**: ✅ Concluída
- **Objetivo**: Perfil completo do médico com agendamento
- **Critérios de Aceite**:
  - [x] Foto grande do médico
  - [x] Badge de especialidade
  - [x] Stats: experiência, reviews, rating
  - [x] Tabs: About, Availability, Education, Review
  - [x] Calendário mensal para seleção de data
  - [x] Time slots: Morning, Afternoon, Evening, Night
  - [x] Botão "Appointment Now"

### TASK-009: Exams Page
- **Responsável**: Sonnet
- **Dependências**: TASK-003, TASK-004
- **Status**: ✅ Concluída
- **Objetivo**: Listagem de resultados de exames
- **Critérios de Aceite**:
  - [x] Título "Lab Results" com subtítulo "Past 12 Months"
  - [x] Cards com nome do exame, valor, unidade
  - [x] Indicador visual de range (In-Range/Below/Above) com cores
  - [x] Mês/ano do resultado
  - [x] Link para detalhe

### TASK-010: Prescriptions Page
- **Responsável**: Sonnet
- **Dependências**: TASK-003, TASK-004
- **Status**: ✅ Concluída
- **Objetivo**: Listagem de prescrições e medicamentos
- **Critérios de Aceite**:
  - [x] Título "Medication Record"
  - [x] Filtros por categoria (tabs)
  - [x] Timeline vertical com meses
  - [x] Indicadores de medicamento com cores
  - [x] Status de cada mês (tomou/não tomou)

### TASK-011: Digital Card Page
- **Responsável**: Sonnet
- **Dependências**: TASK-003, TASK-004
- **Status**: ✅ Concluída
- **Objetivo**: Carteirinha digital do beneficiário
- **Critérios de Aceite**:
  - [x] Card estilizado com gradiente
  - [x] Nome do beneficiário
  - [x] Número do plano
  - [x] Validade
  - [x] QR Code ou barcode simulado
  - [x] Botão de compartilhar

### TASK-012: Profile Page
- **Responsável**: Sonnet
- **Dependências**: TASK-003, TASK-004
- **Status**: ✅ Concluída
- **Objetivo**: Tela de perfil e dados pessoais
- **Critérios de Aceite**:
  - [x] Avatar editável
  - [x] Dados pessoais (nome, email, telefone, data nascimento)
  - [x] Dados do plano
  - [x] Configurações (notificações, privacidade)
  - [x] Botão de logout
  - [x] Links para termos de uso e privacidade

### TASK-013: Notifications Page
- **Responsável**: Sonnet
- **Dependências**: TASK-003, TASK-004
- **Status**: ✅ Concluída
- **Objetivo**: Central de notificações
- **Critérios de Aceite**:
  - [x] Lista de notificações agrupadas por data
  - [x] Ícone por tipo (consulta, exame, receita, geral)
  - [x] Indicador de não lida
  - [x] Ação de marcar como lida
  - [x] Empty state quando sem notificações

---

## Sprint 2 — Funcionalidade e Integrações

### TASK-014: Supabase Setup e Migrations — Concluída localmente
- Configuração do Supabase local, migration com RLS e bucket privado de PDFs, e seed com 10 médicos fictícios.
- A migration `202610220001_sprint_2.sql` foi aplicada pelo stack local em 22/10/2026. Nenhuma migration foi enviada a um projeto hospedado.

### TASK-015: Autenticação — Implementada; validada localmente
- Login, cadastro, callback PKCE, atualização de sessão no middleware, proteção das rotas do portal e logout Supabase.
- Cadastro real via Auth local emitiu sessão e criou o perfil próprio; o teste removeu a conta ao finalizar. A UI usa a URL/chave pública local sem BOM em `.env.local`; o fallback de demonstração permanece quando Supabase não está configurado.

### TASK-016: CRUD de Consultas com Supabase — Implementado; RLS validado
- APIs GET/POST/PATCH/DELETE autenticadas, validação de ownership e fluxos de criação, reagendamento e cancelamento na interface.
- Teste SQL local confirmou criação/leitura própria, ocultação de consultas de terceiros e bloqueio de criação em nome de outro usuário.

### TASK-017: Busca de Médicos com Filtros — Implementada e validada no app local
- Busca por nome/especialidade/CRM, filtro de especialidade/modalidade e ordenação por avaliação em `/api/doctors`.
- O endpoint local respondeu HTTP 200 e encontrou o médico fictício de cardiologia. Dados reais da rede credenciada dependem de uma fonte fornecida pelo projeto.

### TASK-018: Upload e Visualização de Laudos (PDF) — Implementado; bucket privado validado
- API valida arquivo PDF (assinatura, MIME, extensão e até 10 MB), armazena em bucket privado e fornece URL assinada por 60 segundos.
- A migration local criou o bucket privado e suas políticas por usuário. O teste end-to-end enviou um PDF pela API, abriu a URL assinada e confirmou bloqueio de leitura por outro paciente.

### TASK-019: Notificações em Tempo Real — Implementadas; evento validado
- Consulta e atualização do estado lido autenticadas; assinatura Supabase Realtime filtrada por `user_id` e publicação configurada na migration.
- O teste end-to-end recebeu via WebSocket um evento de inserção filtrado pelo usuário autenticado.

### TASK-020: Testes Unitários e de Integração — Concluída para escopo local atual
- Vitest: 4 testes unitários de payload/status de consultas e validação de PDF.
- `pnpm test:integration`: teste contra o Next e Supabase locais para Auth, CRUD e ownership de consultas, upload/leitura/isolamento de PDFs e evento Realtime WebSocket. Usuários e arquivos de teste são removidos no teardown.
- pgTAP (`pnpm test:db`): 10 testes locais para seed público, trigger/perfil, RLS de consultas/exames/notificações, bloqueio de escrita entre usuários, bucket privado e publicação Realtime.
- O stack de teste usa apenas dados e usuários fictícios. O teste simula cookies SSR de sessão; não substitui uma avaliação manual completa da experiência visual no browser.

### Registro de execução — Sprint 2
- **Dependências**: `@supabase/ssr`, `@supabase/supabase-js`, Vitest 2.1.9; Supabase CLI 2.114.0 instalado no ambiente local.
- **Arquivos/áreas**: clientes SSR/browser e middleware Supabase, login/callback, APIs de consultas/médicos/exames/notificações/perfil, migration/seed/testes SQL e configuração local.
- **Validação do banco**: Docker Desktop 29.8.2 iniciado; `supabase start` aplicou migration e seed sem erro. `pnpm test:db` passou com 10 testes pgTAP.
- **Validação da aplicação**: `pnpm test:integration` passou em Auth, CRUD de consultas com isolamento entre usuários, upload e leitura de PDF com URL assinada, bloqueio de leitura por outro usuário e evento Realtime WebSocket. `GET /api/doctors?q=Cardiologia` retornou HTTP 200 com 1 resultado.
- **Verificações executadas**: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test` (4 testes), `pnpm test:db` (10 pgTAP), `pnpm test:integration` e `pnpm build` (19 rotas) passaram após a atualização para Next.js 15.5.28 e React 19.3.1.
- **Ambiente/segurança**: `.env.local` contém somente URL e chave pública do Supabase local, sem BOM, e é ignorado pelo Git. Nenhum projeto hospedado foi acessado; nenhum segredo administrativo foi gravado no app. Não houve deploy.
- **Observação local**: Postgres, Auth, REST, Storage e Realtime estão saudáveis. O contêiner opcional `supabase_vector` reinicia porque não consegue acessar a API de logs do Docker; isso não afetou o app nem os testes.

---
## Revisões do Opus

| Task | Data | Status | Observações |
|------|------|--------|-------------|
| TASK-001 | 2026-10-22 | ✅ Aprovada | Scaffolding correto, build clean, deps instaladas |
| TASK-002 | 2026-10-22 | ✅ Aprovada | Design system sólido, StatusBadge excelente, BottomNav com animações |
| TASK-003 | 2026-10-22 | ✅ Aprovada | Mock data completo, bem tipado, re-exportação unificada |
| TASK-004 | 2026-10-22 | ✅ Aprovada | AppShell responsivo, sidebar desktop, bottom nav mobile |
| TASK-005 | 2026-10-22 | ⚠️ Com correções | Falta calendário semanal, seção médicos populares, animações |
| TASK-006 | 2026-10-22 | ⚠️ Com correções | Falta HeroCard, separação Upcoming/History, calendário |
| TASK-007 | 2026-10-22 | ⚠️ Com correções | Falta barra de busca, filtros por especialidade |
| TASK-008 | 2026-10-22 | ❌ Não entregue | Página /doctors/[id] não foi criada |
| TASK-009 | 2026-10-22 | ✅ Aprovada | Exams page funcional e bem estruturada |
| TASK-010 | 2026-10-22 | ⚠️ Com correções | Falta timeline de adesão, filtros |
| TASK-011 | 2026-10-22 | ✅ Aprovada | Carteirinha digital premium com gradiente |
| TASK-012 | 2026-10-22 | ⚠️ Com correções | Falta logout, configurações, termos |
| TASK-013 | 2026-10-22 | ⚠️ Com correções | Falta agrupamento por data, marcar como lida |

### Build Verification
- **Data**: 2026-10-22
- **Resultado**: ✅ Build clean, 0 erros TypeScript, 12/12 static pages
- **Bundle**: ~143 kB first load per page

### Auditoria e Continuação Codex
- **Data**: 2026-10-22
- **Estado do repositório**: `C:\healthcare` contém o projeto e `node_modules`; não contém metadados `.git`, então não foi possível verificar alterações com Git.
- **Implementação conferida**: As 13 rotas da Sprint 1 estão presentes, incluindo `/doctors/[id]`. As páginas de consultas, médicos, prescrições, perfil e notificações já continham os fluxos descritos nos critérios.
- **Correções feitas**: Dashboard agora alterna entre médicos disponíveis online e presencial; calendário destaca o dia selecionado. Textos de agendamento/reagendamento e de privacidade deixam explícito que as ações e dados são demonstrativos, sem cobrança, gravação ou envio de e-mail.
- **Verificações**: `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` concluídos sem erros após as correções. O build precisou ser executado fora do sandbox por bloqueio `spawn EPERM`; gerou 12 páginas e a rota dinâmica de detalhes.
- **Pendente**: Sprint 2 (Supabase, autenticação, operações persistidas e testes automatizados). O projeto segue sem backend e não foi possível inspecionar o diff/estado Git porque `.git` não existe nesta pasta.

### Bug Encontrado
- `header.tsx` linha 65: className contém `1` solto ("absolute 1 top-1.5...")
- **Delegado para correção**: Sonnet A
