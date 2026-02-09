# Prompt para @architect — Agente Tributário Architecture

**De:** Morgan (PM)
**Para:** @architect (Aria)
**Data:** 2026-02-09
**Status:** PRD Aprovado — Pronto para Architecture

---

## Contexto

O **Agente Tributário** é uma plataforma SaaS que orienta empresários e contadores sobre a Reforma Tributária Brasileira. Possui dois públicos distintos com necessidades diferentes:
- **Empresário:** Análise do seu regime tributário, recomendações, consultas com IA
- **Contador:** Gestão de portfólio multi-cliente, alertas automáticos, modelo de referral

O PRD está **100% aprovado** e pronto para design técnico. Este documento fornece toda a informação necessária para que você crie a Architecture.

---

## O Que Você Precisa Entregar

### 1. Entity-Relationship Diagram (ER Diagram)

Mapear todas as tabelas identificadas no PRD:

**Tabelas Identificadas:**
- `users` (admin, contador, empresario)
- `companies` (empresas gerenciadas)
- `company_users` (relação N-N entre usuários e empresas)
- `company_branches` (filiais de empresas)
- `audit_logs` (logs de todas as ações sensíveis)
- `receipt_classifications` (classificação fiscal por CNAE)
- `regime_history` (histórico de transições)
- `subscriptions` (planos de pagamento)
- `referrals` (contador libera cliente)
- `chat_history` (conversas com IA)
- `chat_feedback` (feedback das respostas do agente)
- `notifications` (notificações legislativas)
- `counter_alerts` (alertas do contador para cliente)
- Mais conforme necessário...

**Seu Trabalho:**
- Criar ER diagram com todos os relacionamentos
- Definir primary keys, foreign keys, índices
- Documentar constraints (UNIQUE, CHECK, NOT NULL)
- Identificar dados que precisam de criptografia em repouso

---

### 2. Component Architecture Diagram

Mapear os serviços e componentes:

**Frontend (Next.js 16+):**
- Pages: Auth, Onboarding, Dashboard (Empresário), Dashboard (Contador), Análise Comparativa, Chat IA, Admin Panel
- Components: Cards, Tabelas, Gráficos, Chat Widget, Forms
- State Management: Zustand (global state)
- API Integration: calls para `/api/v1/...` endpoints

**Backend (Node.js + Express/Next.js API Routes):**
- Controllers: AuthController, CompanyController, AnalysisController, ChatController, SubscriptionController
- Services: CnpjService (integração BRData), TaxCalculationService, RAGService, NotificationService
- Data Access Layer: Prisma ORM
- Middleware: Authentication, Authorization (RBAC), Logging, Error Handling

**External Services:**
- **CNPJ API:** BRData ou Serpro (onboarding)
- **OpenAI API:** GPT-4o (agente conversacional)
- **Vector Database:** Pinecone ou Weaviate (RAG)
- **Payment Gateway:** Stripe (subscriptions)
- **Email Service:** Resend ou SendGrid (notificações)
- **Job Scheduler:** Bull (Redis-backed)
- **Logging:** Winston (application logs)
- **Error Tracking:** Sentry (production monitoring)

**Your Work:**
- Criar diagram mostrando fluxo de dados entre componentes
- Definir APIs REST: endpoints, métodos, payloads, responses
- Documentar integrações externas (autenticação, rate limiting, retry logic)
- Descrever fluxo de autenticação (NextAuth.js) e autorização (RBAC)

---

### 3. Data Flow Diagram (DFD)

Mapear fluxos críticos:

**Fluxo 1: Onboarding Empresário**
- Usuário insere CNPJ → validação → chamada CNPJ API → carrega dados → cria empresa → redireciona dashboard

**Fluxo 2: Análise Tributária**
- Usuário seleciona regime → sistema carrega dados da empresa → executa 3 cálculos tributários → exibe comparação

**Fluxo 3: Chat com Agente IA**
- Usuário faz pergunta → busca semântica em RAG (vector DB) → retrieves docs → passa para OpenAI + prompt → resposta → persistir histórico

**Fluxo 4: Notificação Legislativa**
- Job scheduler executa (2ª-feira 02:00) → detecta novos docs → embedding com OpenAI → upsert vector DB → busca empresas relevantes → dispara notificações

**Your Work:**
- Detalhar cada fluxo com sequência de chamadas
- Identificar pontos de falha e estratégia de erro
- Documentar latências esperadas (NFR2: < 2s para dashboards)
- Descrever caching strategy (Redis)

---

### 4. API Specification (OpenAPI/Swagger)

Definir todos os endpoints REST:

**Exemplos (não exaustivo):**
- `POST /api/v1/auth/register` — Cadastro de usuário
- `POST /api/v1/auth/login` — Login
- `GET /api/v1/companies` — Listar empresas do usuário
- `POST /api/v1/companies` — Criar empresa (via CNPJ)
- `GET /api/v1/companies/:id/analysis` — Análise tributária
- `POST /api/v1/chat` — Enviar mensagem ao agente IA
- `GET /api/v1/notifications` — Listar notificações
- `POST /api/v1/referrals` — Ativar referral para cliente

**Your Work:**
- Criar OpenAPI spec (YAML) com todos os endpoints
- Documentar request/response schemas
- Definir error codes e mensagens
- Especificar rate limiting (ex: 10 msg/min para chat)
- Documentar autenticação (Bearer token, NextAuth session)

---

### 5. Security & Compliance Design

**Autenticação:**
- Implementar NextAuth.js com suporte a email/senha + OAuth2 (Google)
- Password hashing: bcrypt
- Sessão: JWT ou cookie httpOnly/secure

**Autorização (RBAC):**
- Roles: admin, contador, empresario
- Middleware que valida role em cada rota
- Contador só acessa suas próprias empresas

**Criptografia:**
- TLS 1.3+ para dados em trânsito
- Criptografia em repouso para: CNPJ, faturamento, dados financeiros (banco de dados)
- Estratégia: usar banco de dados nativo (PostgreSQL pgcrypto) ou application-level

**LGPD Compliance:**
- Audit logs para todas as ações sensíveis (2 anos de retenção)
- Direito ao esquecimento (deletar dados de usuário)
- Consentimento explicito para coleta de dados
- Criptografia de dados pessoais

**Your Work:**
- Detalhar implementação de autenticação/autorização
- Documentar estratégia de criptografia (in-transit, at-rest)
- Criar checklist de LGPD compliance
- Descrever auditoria e logging strategy

---

### 6. Deployment & Infrastructure

**Frontend:**
- Vercel (Next.js + Tailwind CSS)
- Environment variables: API_BASE_URL, NEXTAUTH_SECRET, etc.
- CI/CD: GitHub Actions → Vercel deploy

**Backend:**
- Railway, Heroku, ou Node.js auto-hosted
- Docker container with node:18+
- Environment variables: DB_URL, OPENAI_API_KEY, STRIPE_KEY, etc.
- CI/CD: GitHub Actions → build image → deploy

**Database:**
- PostgreSQL 15+ (Supabase ou AWS RDS)
- Automated backups (daily)
- Migration strategy (Prisma ORM)

**Cache:**
- Redis (Upstash ou Heroku Redis)
- TTL strategy para cache de RAG, respostas de IA

**Vector Database (RAG):**
- Pinecone (managed) ou Weaviate (self-hosted)
- Embedding model: OpenAI ada-embedding
- Index structure: nested by CNAE + regime + UF (para relevância)

**Monitoring:**
- Sentry (error tracking)
- Winston (application logs)
- Prometheus + Grafana (opcional, para métricas)
- Datadog (opcional, para APM)

**Your Work:**
- Documentar arquitetura de deploy (frontend, backend, database, cache, vector DB)
- Criar terraform/IaC scripts (opcional, mas recomendado)
- Descrever CI/CD pipeline (test → build → deploy)
- Documentar SLA (99.5% uptime) e disaster recovery

---

### 7. Known Technical Risks & Mitigations

**Risk 1: RAG Relevancy**
- **Problem:** Busca semântica pode retornar documentos irrelevantes
- **Mitigation:** Implementar thresholds de similaridade, feedback de usuário, refinamento de prompts
- **Owner:** Dev (Story 4.2)

**Risk 2: OpenAI API Costs & Rate Limiting**
- **Problem:** Custos variáveis com volume, rate limiting pode afetar UX
- **Mitigation:** Implementar rate limiting por user (Story 4.1), cache de respostas (Epic 6), considerar GPT-3.5 para some queries
- **Owner:** Dev (Story 4.1, Epic 6)

**Risk 3: CNPJ API Availability**
- **Problem:** Se API cair, onboarding quebra
- **Mitigation:** Fallback para manual input, retry exponential, monitorar uptime
- **Owner:** Dev (Story 1.4)

**Risk 4: Escalabilidade de Notificações**
- **Problem:** Milhares de alertas simultâneos = alta carga de email/SMS
- **Mitigation:** Queue-based delivery (Bull), batching, rate limiting
- **Owner:** Dev (Epic 6)

**Your Work:**
- Expandir lista de riscos identificados
- Detalhar mitigações técnicas
- Priorizar riscos (BLOCKER vs. HIGH vs. MEDIUM)

---

### 8. Performance & Scalability Strategy

**Latency Targets (NFR2):**
- Dashboard load: < 2 seconds
- Chat response start: < 2 seconds
- Cálculo tributário: < 20ms
- RAG search: < 500ms

**Scaling Strategy:**
- **Horizontal scaling:** API servers (stateless)
- **Database:** Read replicas para dashboards pesados
- **Cache:** Redis para respostas frequentes
- **CDN:** Vercel já inclui CDN para frontend

**Load Testing:**
- Simular 100 requisições/segundo simultâneas (NFR4)
- Testar com 10,000 usuários no sistema
- Identificar gargalos

**Your Work:**
- Criar performance budget (frontend, backend, database)
- Documentar caching strategy
- Descrever load testing plan

---

## Documentação que Você Deve Gerar

1. **Architecture Document (Markdown)** — 20-30 páginas
   - Overview + diagrams
   - ER diagram + database schema
   - API specification (OpenAPI/Swagger YAML)
   - Component architecture
   - Data flow diagrams
   - Security & compliance design
   - Deployment & infrastructure
   - Risk mitigation
   - Performance strategy

2. **ER Diagram (PNG/PDF)** — Visual representation de banco de dados

3. **Component Diagram (PNG/PDF)** — Visual de serviços e integrações

4. **DFD (PNG/PDF)** — Data flow para fluxos críticos

5. **OpenAPI Spec (YAML)** — Machine-readable API definition

6. **Deployment Runbook (Markdown)** — Passo-a-passo para setup inicial

---

## Informações do PRD (Para Referência Rápida)

**Tech Stack Recomendado:**
- Frontend: Next.js 16+, React, TypeScript, Tailwind CSS, Zustand
- Backend: Node.js, Express (ou Next.js API routes)
- Database: PostgreSQL 15+
- Cache: Redis
- Vector DB: Pinecone ou Weaviate
- Payment: Stripe
- Job Scheduler: Bull (Redis-backed)
- Auth: NextAuth.js
- Logging: Winston
- Error Tracking: Sentry

**Key Numbers:**
- 6 Epics, ~30 Stories
- Timeline: 2-3 months (2 devs) or 2-2.5 months (3 devs)
- MRR Target: R$ 10-50k em 6 meses (MVP)
- User Types: Empresário, Contador, Admin

**Critical Features:**
1. Onboarding via CNPJ (Story 1.4)
2. Análise tributária 3-way comparison (Epic 2)
3. Dashboards contextuais (Epic 3)
4. Agente IA conversacional (Epic 4)
5. Monetização hybrid (Epic 5)
6. Automação de alertas (Epic 6)

---

## Como Proceder

1. **Ler PRD completo** em `docs/prd.md`
2. **Fazer perguntas** sobre requisitos ambíguos
3. **Criar Architecture Document** com todas as seções acima
4. **Validar com PM** (você pode me chamar)
5. **Entregar para Dev** para início da implementação

---

## Contato & Dúvidas

**PM:** Morgan (disponível via chat)
**PRD Location:** `docs/prd.md`
**Timeline:** Arquitetura deve ficar pronta em 3-5 dias (recomendado)

---

**Próximo Passo:** @architect cria Architecture Document

Status: ✅ PRD aprovado, pronto para design técnico.

