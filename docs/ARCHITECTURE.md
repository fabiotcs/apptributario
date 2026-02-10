# 🏛️ Agente Tritutario — Architecture Document

**Version:** 1.0
**Date:** 2026-02-09
**Architect:** Aria (System Architect)
**Status:** 🟢 DRAFT
**Last Updated:** Feb 9, 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Entity-Relationship Diagram](#2-entity-relationship-diagram-er-diagram)
3. [Component Architecture](#3-component-architecture)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [API Specification (OpenAPI)](#5-api-specification-openapi)
6. [Security & Compliance](#6-security--compliance)
7. [Deployment & Infrastructure](#7-deployment--infrastructure)
8. [Risk Analysis & Mitigations](#8-risk-analysis--mitigations)
9. [Performance & Scalability](#9-performance--scalability)
10. [Appendix](#10-appendix)

---

## 1. Architecture Overview

### 1.1 System Context

**Agente Tritutario** is a SaaS platform that guides Brazilian entrepreneurs and accountants through the Reforma Tributária (2025-2027). The system serves two distinct user types:

- **Entrepreneurs (Empresários):** Individual business owners seeking tax guidance, regime analysis, and AI-powered consultations
- **Accountants (Contadores):** Professional accountants managing portfolios of 5-50+ client companies with centralized alerts, recommendations, and referral revenue streams

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER LAYER                                  │
│  Web (Next.js 16+) │ Mobile (Web-responsive) │ Voice Interface  │
└────────────────────┬─────────────────────────┬──────────────────┘
                     │                         │
┌────────────────────┴─────────────────────────┴──────────────────┐
│                  BACKEND LAYER (Node.js)                         │
│  Express.js API Routes │ Service Layer │ Data Access (Prisma)  │
├──────────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                    │
│  PostgreSQL (Primary) │ Redis (Cache) │ Pinecone (Vector DB)   │
├──────────────────────────────────────────────────────────────────┤
│              EXTERNAL INTEGRATIONS                               │
│  OpenAI │ CNPJ API │ Stripe │ Email Service │ Job Scheduler    │
└──────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Architectural Principles

1. **Monorepo-First** — Single repository with `apps/web`, `apps/api`, `packages/*` for code sharing
2. **API-Driven** — Frontend consumes backend via REST API v1 endpoints
3. **Data-Centric** — Database schema drives architecture decisions
4. **Stateless Backend** — Horizontal scalability via stateless services
5. **Event-Driven Notifications** — Job scheduler (Bull) for async tasks
6. **Defense in Depth** — Security at every layer (auth, encryption, RBAC)
7. **Progressive Enhancement** — Works on low-bandwidth connections
8. **Observability First** — Logging, monitoring, error tracking from day 1

---

## 2. Entity-Relationship Diagram (ER Diagram)

### 2.1 Core Tables

#### **users** — Authentication & Identity
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'contador', 'empresario') NOT NULL,
  phone VARCHAR(20),

  -- OAuth2
  oauth_provider VARCHAR(50), -- 'google', 'github', null if email/password
  oauth_id VARCHAR(255),

  -- Account Status
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP, -- soft delete for LGPD

  UNIQUE INDEX idx_oauth (oauth_provider, oauth_id),
  INDEX idx_role (role),
  INDEX idx_email_status (email, status)
);
```

#### **companies** — Business Entities
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(14) UNIQUE NOT NULL, -- encrypted at rest
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),

  -- Tax Classification
  cnae_code VARCHAR(10) NOT NULL, -- CNAE 2.3
  current_tax_regime ENUM('SIMPLES', 'LUCRO_PRESUMIDO', 'LUCRO_REAL') NOT NULL,

  -- Financial Data
  annual_revenue DECIMAL(15,2), -- encrypted at rest
  employee_count INT,

  -- Location
  address_zipcode VARCHAR(8) NOT NULL,
  address_city VARCHAR(100),
  address_state VARCHAR(2),

  -- Metadata
  status ENUM('active', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_cnpj (cnpj),
  INDEX idx_cnae (cnae_code),
  INDEX idx_regime (current_tax_regime),
  INDEX idx_status (status)
);
```

#### **company_users** — N-N Relationship (User ↔ Company)
```sql
CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Permission
  role ENUM('owner', 'manager', 'viewer') NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_company_user (company_id, user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_role (role)
);
```

#### **company_branches** — Multi-Branch Support
```sql
CREATE TABLE company_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Location (can be in different states)
  address_state VARCHAR(2) NOT NULL,
  address_city VARCHAR(100),

  -- Tax Filing
  cepe_code VARCHAR(10), -- Código de Estabelecimento
  is_main_branch BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_state (company_id, address_state)
);
```

#### **regime_history** — Tax Regime Transitions
```sql
CREATE TABLE regime_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  old_regime ENUM('SIMPLES', 'LUCRO_PRESUMIDO', 'LUCRO_REAL'),
  new_regime ENUM('SIMPLES', 'LUCRO_PRESUMIDO', 'LUCRO_REAL') NOT NULL,

  -- Reason & Impact
  reason VARCHAR(500),
  financial_impact_estimated DECIMAL(15,2), -- estimated tax savings/costs

  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_date (company_id, effective_date)
);
```

#### **receipt_classifications** — Fiscal Classification
```sql
CREATE TABLE receipt_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  company_branch_id UUID,

  -- Classification
  receipt_type ENUM('INVOICED_SERVICE', 'INVOICED_PRODUCT', 'RPA', 'OTHER') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  classification_date DATE NOT NULL,

  -- Tax Impact
  tax_regime_applied ENUM('SIMPLES', 'LUCRO_PRESUMIDO', 'LUCRO_REAL') NOT NULL,
  estimated_tax_rate DECIMAL(5,2),
  estimated_tax_amount DECIMAL(15,2),

  -- Verification
  is_manual BOOLEAN DEFAULT FALSE,
  verified_by_user_id UUID,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (company_branch_id) REFERENCES company_branches(id),
  FOREIGN KEY (verified_by_user_id) REFERENCES users(id),
  INDEX idx_company_date (company_id, classification_date),
  INDEX idx_receipt_type (receipt_type)
);
```

#### **chat_history** — AI Agent Conversations
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID, -- NULL if user querying general info
  conversation_id UUID NOT NULL, -- groups multiple messages

  -- Message Content
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL, -- plain text
  content_tokens INT,

  -- RAG Context
  retrieved_documents JSONB, -- vector search results
  search_query TEXT,

  -- Metadata
  model_used VARCHAR(50), -- 'gpt-4o', etc.
  tokens_used INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  INDEX idx_user_conversation (user_id, conversation_id),
  INDEX idx_created_at (created_at)
);
```

#### **chat_feedback** — Quality Feedback
```sql
CREATE TABLE chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Feedback
  rating INT CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
  is_helpful BOOLEAN,
  feedback_text TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (message_id) REFERENCES chat_history(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_message_user_feedback (message_id, user_id)
);
```

#### **notifications** — Legislative & System Alerts
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  type ENUM('LEGISLATIVE', 'SYSTEM', 'REFERRAL') NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,

  -- Targeting
  target_role ENUM('admin', 'contador', 'empresario') NOT NULL,
  cnae_codes JSON, -- which CNAE codes are affected
  tax_regimes JSON, -- ['SIMPLES', 'LUCRO_REAL']

  -- Publishing
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_pinned BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_published (published_at),
  INDEX idx_type (type),
  INDEX idx_target_role (target_role)
);
```

#### **counter_alerts** — Contador → Client Alerts
```sql
CREATE TABLE counter_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contador_user_id UUID NOT NULL,
  target_company_id UUID NOT NULL,
  target_user_id UUID NOT NULL, -- empresario

  -- Alert Content
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  alert_type ENUM('REGIME_RECOMMENDATION', 'COMPLIANCE', 'TAX_OPTIMIZATION', 'CUSTOM') NOT NULL,

  -- Targeting
  is_read BOOLEAN DEFAULT FALSE,
  is_actioned BOOLEAN DEFAULT FALSE,
  action_taken_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (contador_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_target_user (target_user_id, is_read),
  INDEX idx_contador (contador_user_id)
);
```

#### **subscriptions** — Monetization
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Plan
  plan_type ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE') NOT NULL,
  billing_cycle ENUM('MONTHLY', 'ANNUAL') NOT NULL,

  -- Stripe Integration
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,

  -- Dates
  started_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP,
  renews_at TIMESTAMP,

  -- Status
  status ENUM('ACTIVE', 'PAUSED', 'CANCELLED') DEFAULT 'ACTIVE',
  cancelled_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_renews_at (renews_at)
);
```

#### **referrals** — Contador Revenue Model
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contador_user_id UUID NOT NULL,
  empresario_user_id UUID NOT NULL,
  company_id UUID NOT NULL,

  -- Referral Status
  status ENUM('PENDING', 'ACTIVATED', 'DECLINED') DEFAULT 'PENDING',
  discount_percentage DECIMAL(5,2), -- can offer 10%, 20%, etc.

  -- Revenue Tracking
  referral_fee_percentage DECIMAL(5,2), -- contador gets X% commission
  lifetime_revenue_generated DECIMAL(15,2) DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (contador_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (empresario_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_referral_unique (contador_user_id, company_id),
  INDEX idx_status (status)
);
```

#### **audit_logs** — LGPD Compliance
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID,

  -- Action Details
  action VARCHAR(100) NOT NULL, -- 'LOGIN', 'CREATED_COMPANY', 'VIEWED_ANALYSIS', etc.
  resource_type VARCHAR(50), -- 'USER', 'COMPANY', 'CHAT', etc.
  resource_id UUID,

  -- Change Details
  changes_before JSONB, -- old state (for sensitive fields)
  changes_after JSONB, -- new state
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_created_retention (created_at), -- for LGPD 2-year retention
);
```

### 2.2 ER Diagram (Textual Representation)

```
┌─────────────────────────────────────┐
│             users                   │
│  id (PK, UUID)                      │
│  email (UNIQUE)                     │
│  password_hash                      │
│  role (admin|contador|empresario)   │
│  oauth_provider, oauth_id           │
│  created_at, updated_at, deleted_at │
└────────────┬────────────────────────┘
             │
             │ 1:N (owns companies via company_users)
             │
       ┌─────┴─────────────────────────────────────────────┐
       │                                                   │
┌──────┴──────────────────────────────────────┐   ┌──────┴──────────────────┐
│        company_users (Junction)             │   │   subscriptions         │
│  id, company_id (FK), user_id (FK)          │   │  id, user_id (FK)       │
│  role (owner|manager|viewer)                │   │  plan_type (plan)       │
└──────┬──────────────────────────────────────┘   │  stripe_customer_id     │
       │                                           └────────────────────────┘
       │ N:1
       │
┌──────┴─────────────────────────────────────────────────────────┐
│                companies                                        │
│  id (PK, UUID)                                                 │
│  cnpj (UNIQUE, encrypted)                                      │
│  name, legal_name                                              │
│  cnae_code, current_tax_regime                                │
│  annual_revenue (encrypted), employee_count                   │
│  address fields                                                │
└──────┬──────────────────┬────────────┬──────────────┬─────────┘
       │                  │            │              │
       │ 1:N              │ 1:N        │ 1:N          │ 1:N
       │                  │            │              │
   ┌───┴────────────┐  ┌──┴──────────┐ ┌──┴──────────┐ ┌──┴──────────────┐
   │ company_       │  │ regime_     │ │ receipt_    │ │ counter_        │
   │ branches       │  │ history     │ │ classif.    │ │ alerts          │
   │─────────────   │  │─────────────│ │─────────────│ │─────────────    │
   │ id, company_id │  │ id, comp_id │ │ id, comp_id │ │ id, comp_id     │
   │ name, state    │  │ regimes,    │ │ type,       │ │ titulo_user_id  │
   └────────────────┘  │ effective   │ │ amount      │ │ target_user_id  │
                       └─────────────┘ └─────────┬────┘ │ type, status    │
                                                 │       └─────────────────┘
                                                 │ 1:N
                                                 │
                                         ┌───────┴────────────┐
                                         │  chat_history      │
                                         │──────────────────  │
                                         │ id, user_id (FK)   │
                                         │ company_id (FK)    │
                                         │ conversation_id    │
                                         │ role, content      │
                                         │ retrieved_docs     │
                                         │ tokens_used        │
                                         └────────┬───────────┘
                                                  │ 1:N
                                                  │
                                              ┌───┴──────────────┐
                                              │ chat_feedback    │
                                              │─────────────────│
                                              │ id, message_id  │
                                              │ user_id, rating │
                                              │ is_helpful      │
                                              └─────────────────┘

┌─────────────────────────────────────┐
│      notifications                  │
│  id, type, title, body              │
│  target_role, cnae_codes, regimes   │
│  published_at, expires_at           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      referrals                      │
│  id, contador_user_id               │
│  empresario_user_id, company_id     │
│  status, discount_pct               │
│  referral_fee_pct, revenue          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      audit_logs                     │
│  id, user_id, company_id            │
│  action, resource_type              │
│  changes_before, changes_after      │
│  ip_address, user_agent, created_at │
└─────────────────────────────────────┘
```

### 2.3 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **PK Type** | UUID (gen_random_uuid) | Globally unique, doesn't leak sequential info |
| **Encryption** | Database + Application | CNPJ, revenue at rest; TLS for transit |
| **Soft Deletes** | deleted_at column | LGPD right to be forgotten + audit trail |
| **Audit Logs** | 2-year retention | LGPD requirement (Lei 13.709/2018) |
| **Relationships** | CASCADE on user/company | Maintain referential integrity, simplify cleanup |
| **Indexes** | Composite on common queries | Fast lookups for user→company, created_at filters |
| **Normalization** | 3NF | Balanced: normalized for transactions, denormalized for analytics |

---

## 3. Component Architecture

### 3.1 Frontend Architecture (Next.js 16+)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── oauth-callback/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── [role]/page.tsx  # empresario | contador | admin
│   │   │   └── layout.tsx
│   │   ├── analysis/
│   │   │   ├── comparison/page.tsx  # tax regime comparison
│   │   │   └── details/[id]/page.tsx
│   │   └── companies/
│   │       ├── [id]/page.tsx
│   │       └── add/page.tsx
│   ├── chat/
│   │   ├── page.tsx        # Chat UI
│   │   └── [conversationId]/page.tsx
│   ├── admin/
│   │   ├── users/page.tsx
│   │   ├── companies/page.tsx
│   │   └── notifications/page.tsx
│   ├── api/ (Next.js API routes - thin layer)
│   │   └── auth/[...nextauth].ts  # NextAuth.js handler
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
│
├── components/
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Dashboard/
│   │   ├── DashboardCard.tsx
│   │   ├── MetricsPanel.tsx
│   │   └── CompanySelector.tsx
│   ├── Analysis/
│   │   ├── RegimeComparison.tsx
│   │   ├── TaxChart.tsx
│   │   └── RecommendationCard.tsx
│   ├── Chat/
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── SourcesPanel.tsx
│   │   └── ConversationList.tsx
│   ├── Notifications/
│   │   ├── NotificationBell.tsx
│   │   └── NotificationList.tsx
│   └── Common/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Modal.tsx
│
├── hooks/
│   ├── useAuth.ts       # auth context
│   ├── useCompany.ts    # company data
│   ├── useChat.ts       # chat WebSocket
│   └── useAnalysis.ts   # analysis data
│
├── store/               # Zustand
│   ├── authStore.ts     # user, session
│   ├── companyStore.ts  # selected company
│   ├── chatStore.ts     # messages, conversations
│   └── notificationStore.ts
│
├── utils/
│   ├── api.ts           # axios instance with auth
│   ├── formatters.ts    # BRL, CNPJ, date
│   └── validators.ts    # form validation
│
└── styles/
    └── globals.css      # Tailwind
```

**Frontend Technologies:**
- **Framework:** Next.js 16+ (App Router)
- **Styling:** Tailwind CSS 3+
- **State Management:** Zustand
- **API Client:** fetch API with auth interceptor
- **Auth:** NextAuth.js (JWT + session)
- **Form Validation:** Zod schemas
- **Charts:** Chart.js or Recharts
- **Accessibility:** WCAG AA compliance (semantic HTML, ARIA)
- **Mobile:** Responsive design, touch-friendly

### 3.2 Backend Architecture (Node.js + Express)

```
apps/api/
├── src/
│   ├── server.ts           # Express app entry
│   ├── middleware/
│   │   ├── auth.ts         # JWT verification
│   │   ├── rbac.ts         # role-based access
│   │   ├── errorHandler.ts # global error handling
│   │   └── logging.ts      # Winston logger
│   ├── routes/
│   │   ├── auth.ts         # POST /auth/register, /auth/login
│   │   ├── companies.ts    # CRUD /companies
│   │   ├── analysis.ts     # POST /companies/:id/analysis
│   │   ├── chat.ts         # POST /chat, GET /chat/:id
│   │   ├── notifications.ts# GET /notifications
│   │   └── admin.ts        # admin endpoints
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── CompanyController.ts
│   │   ├── AnalysisController.ts
│   │   ├── ChatController.ts
│   │   └── AdminController.ts
│   ├── services/
│   │   ├── AuthService.ts           # password hash, JWT
│   │   ├── CompanyService.ts        # CRUD logic
│   │   ├── CnpjService.ts           # CNPJ API integration
│   │   ├── TaxCalculationService.ts # regime comparison
│   │   ├── ChatService.ts           # OpenAI + RAG
│   │   ├── RAGService.ts            # Pinecone operations
│   │   ├── NotificationService.ts   # email + push
│   │   └── AnalysisService.ts       # tax analysis
│   ├── repository/
│   │   ├── UserRepository.ts
│   │   ├── CompanyRepository.ts
│   │   ├── ChatRepository.ts
│   │   └── AnalysisRepository.ts
│   ├── models/
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── schemas.ts       # Zod validation schemas
│   ├── utils/
│   │   ├── logger.ts        # Winston setup
│   │   ├── errors.ts        # custom error classes
│   │   ├── crypto.ts        # encryption utilities
│   │   └── validators.ts    # CNPJ, email validators
│   └── config/
│       └── database.ts      # Prisma setup
│
└── __tests__/
    ├── unit/
    └── integration/
```

**Backend Technologies:**
- **Framework:** Express.js 4.18+
- **ORM:** Prisma 5+
- **Database:** PostgreSQL 15+
- **Caching:** Redis 7+
- **Job Queue:** Bull (Redis-backed)
- **Auth:** NextAuth.js + JWT
- **Validation:** Zod
- **Logging:** Winston
- **Error Tracking:** Sentry (optional)
- **Testing:** Jest + Supertest

### 3.3 External Integrations

| Service | Purpose | Integration Point | Rate Limit |
|---------|---------|------------------|------------|
| **OpenAI GPT-4o** | AI conversational agent | ChatService | 3,500 RPM |
| **Pinecone** | Vector database for RAG | RAGService | 100 API calls/min |
| **CNPJ API** | Company data from CNPJ | CnpjService (BRData or Serpro) | 60 req/min |
| **Stripe** | Payment processing | SubscriptionService | standard Stripe limits |
| **Resend** | Email delivery | NotificationService | 100 emails/day (free), unlimited (paid) |
| **Bull Queue** | Job scheduling | Job workers | local Redis limit |

---

## 4. Data Flow Diagrams

### 4.1 Flow 1: Onboarding (Empresário)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ONBOARDING FLOW: New Entrepreneur                                   │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Registration & CNPJ Input
┌─────────────────────────────┐
│ Frontend: Register Form      │
│ - Email, Password, Name     │
│ - CNPJ Input Box            │
└───────────┬─────────────────┘
            │ POST /api/v1/auth/register
            ▼
┌─────────────────────────────┐
│ Backend: AuthController     │
│ 1. Validate email, password │
│ 2. Validate CNPJ format     │
│ 3. Create user (status:0)   │
└───────────┬─────────────────┘
            │ async trigger
            ▼
Step 2: CNPJ Data Enrichment
┌─────────────────────────────┐
│ CnpjService.getCompanyData()│
│ → HTTP to BRData/Serpro API │
└───────────┬─────────────────┘
            │ HTTP 200 + company data
            ▼
┌─────────────────────────────┐
│ CompanyService.createComp.. │
│ 1. Save company to DB       │
│ 2. Save CNAE, current regime│
│ 3. Estimate annual revenue  │
└───────────┬─────────────────┘
            │
            ▼
Step 3: Initial Dashboard
┌─────────────────────────────┐
│ Frontend: Dashboard Page     │
│ - Company Name              │
│ - Current Regime            │
│ - CNAE Classification       │
│ - Recommendations           │
└─────────────────────────────┘

⏱️ Expected Latency: 2-3 seconds (CNPJ API call)
🔄 Caching: Company data cached for 7 days in Redis
🔐 Encrypted: CNPJ, revenue data at rest
```

### 4.2 Flow 2: Tax Analysis (Regime Comparison)

```
┌─────────────────────────────────────────────────────────────────────┐
│ TAX ANALYSIS: Regime Comparison                                     │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Selects "Analyze Regimes"
┌─────────────────────────────┐
│ Frontend: Analysis Page      │
│ - Dropdown: SIMPLES/LR/LP   │
│ - Click "Compare"           │
└───────────┬─────────────────┘
            │ POST /api/v1/companies/:id/analysis
            ▼
Step 2: Backend Tax Calculation
┌──────────────────────────────────────────┐
│ AnalysisService.runTaxComparison()       │
│                                          │
│ For each regime (SIMPLES, LP, LR):      │
│  1. Load company data (revenue, CNAE)   │
│  2. Load regime rules (from cache)      │
│  3. Calculate:                          │
│     - Income tax (IRPJ)                 │
│     - Social contribution (CSLL)        │
│     - PIS/COFINS                        │
│     - INSS employer contribution        │
│  4. Sum total tax amount                │
│  5. Calculate effective tax rate        │
│                                          │
└───────────┬──────────────────────────────┘
            │ [cache hit 95% of time]
            ▼
Step 3: Generate Recommendation
┌──────────────────────────────────────────┐
│ RecommendationService.getBestRegime()    │
│ - Compare effective rates                │
│ - Recommend lowest-tax regime            │
│ - Estimate annual savings                │
│                                          │
└───────────┬──────────────────────────────┘
            │ JSON response
            ▼
Step 4: Frontend Display Results
┌──────────────────────────────────────────┐
│ Frontend: Comparison Table               │
│ ┌─────────────┬────────┬──────┐          │
│ │ Regime      │ Tax %  │ Cost │          │
│ ├─────────────┼────────┼──────┤          │
│ │ SIMPLES ✓   │ 8.5%   │ 42k  │ Recommended
│ │ LP          │ 15%    │ 75k  │          │
│ │ LR          │ 18%    │ 90k  │          │
│ └─────────────┴────────┴──────┘          │
│                                          │
│ Potential Savings: 48k/year              │
└──────────────────────────────────────────┘

⏱️ Expected Latency: < 500ms (cached data)
💾 Database Queries: 2-3 indexed queries
🚀 Optimization: Regime rules cached, pre-calculated tax tables
```

### 4.3 Flow 3: Chat with AI Agent

```
┌─────────────────────────────────────────────────────────────────────┐
│ CHAT FLOW: User → AI Agent (RAG + OpenAI)                           │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Sends Message
┌──────────────────────────────┐
│ Frontend: Chat Input Box      │
│ "Qual o melhor regime?"      │
│ Click Send                    │
└───────────┬──────────────────┘
            │ POST /api/v1/chat
            │ { content: "...", conversation_id: UUID }
            ▼
Step 2: RAG Semantic Search
┌──────────────────────────────────────────┐
│ ChatService:                             │
│ 1. Extract query intent                  │
│ 2. Call RAGService.search()              │
│                                          │
│ RAGService:                              │
│ 1. Embed query with OpenAI (embedding)  │
│ 2. Search Pinecone vector DB            │
│    - Returns top 5 documents             │
│    - Relevance score > 0.7               │
│ 3. Return: [doc1, doc2, doc3, ...]     │
│                                          │
└───────────┬──────────────────────────────┘
            │ 200-400ms
            ▼
Step 3: Build LLM Context
┌──────────────────────────────────────────┐
│ Prompt Engineering:                      │
│                                          │
│ System: "Você é especialista em....."   │
│                                          │
│ Context: [Retrieved documents]           │
│                                          │
│ Company Context:                         │
│ - CNAE: 4110-2/04                       │
│ - Revenue: R$ 500k                      │
│ - Current Regime: SIMPLES                │
│                                          │
│ User Query: "Qual o melhor regime?"    │
│                                          │
└───────────┬──────────────────────────────┘
            │
            ▼
Step 4: LLM Generation
┌──────────────────────────────────────────┐
│ OpenAI GPT-4o API:                       │
│ - Receive prompt + context               │
│ - Stream response tokens                 │
│ - Estimated tokens: 150-300              │
│                                          │
└───────────┬──────────────────────────────┘
            │ streaming response
            ▼
Step 5: Persist & Display
┌──────────────────────────────────────────┐
│ Backend:                                 │
│ 1. Save message to chat_history          │
│ 2. Save retrieved_documents              │
│ 3. Record tokens_used                    │
│                                          │
│ Frontend:                                │
│ 1. Stream tokens to chat UI              │
│ 2. Display sources panel                 │
│ 3. Save conversation                     │
│                                          │
└──────────────────────────────────────────┘

⏱️ Expected Latency: 3-5 seconds
  - RAG search: 400ms
  - OpenAI generation: 2-4s
💾 Database: 1 insert (chat_history)
🚀 Optimization: Stream response, cache embeddings
🔐 Security: Content moderation on user input
```

### 4.4 Flow 4: Legislative Update & Notification

```
┌─────────────────────────────────────────────────────────────────────┐
│ NOTIFICATION FLOW: Legislative Update Pipeline                      │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Scheduled Job Trigger
┌──────────────────────────────┐
│ Bull Job: updateLegislation  │
│ Cron: "0 2 * * 1" (2 AM Mon) │
│                              │
└───────────┬──────────────────┘
            │ Job Worker
            ▼
Step 2: Fetch New Documents
┌──────────────────────────────────────────┐
│ NotificationService.fetchNewDocs():      │
│ - Crawl legislação.gov.br                │
│ - Check for new acts, resolutions        │
│ - Filter: only Reforma Tributária docs   │
│ - Compare with last run (store hash)     │
│                                          │
└───────────┬──────────────────────────────┘
            │ [if new docs found]
            ▼
Step 3: Embedding & Vector Indexing
┌──────────────────────────────────────────┐
│ For each new document:                   │
│ 1. Extract text + metadata               │
│ 2. Call OpenAI Embedding API             │
│ 3. Upsert to Pinecone                    │
│    - Document ID: UUID                   │
│    - Vector: 1536-dim embedding          │
│    - Metadata: doc_type, cnae[], regime[]│
│                                          │
└───────────┬──────────────────────────────┘
            │ 500-1000ms per doc
            ▼
Step 4: Targeted Notification
┌──────────────────────────────────────────┐
│ NotificationService.targetUsers():       │
│                                          │
│ For each new doc:                        │
│ 1. Extract affected CNAE codes           │
│ 2. Extract affected tax regimes          │
│ 3. Query: users WHERE                    │
│      company.cnae IN doc.cnae OR         │
│      company.regime IN doc.regime        │
│ 4. Create notification record            │
│                                          │
└───────────┬──────────────────────────────┘
            │ [bulk insert]
            ▼
Step 5: Push to Frontend
┌──────────────────────────────────────────┐
│ Notification Delivery:                   │
│ 1. Email to user (Resend API)            │
│ 2. In-app notification (SSE or WebSocket)│
│ 3. SMS (optional, if user opted-in)      │
│                                          │
│ Counter Alert (if Contador):             │
│ - Contador sees alert in dashboard       │
│ - Can create alert for their clients     │
│                                          │
└──────────────────────────────────────────┘

⏱️ Total Job Time: 5-10 minutes
  - Crawl: 1-2min
  - Embedding: 2-5min (parallel for 5-10 docs)
  - Notification: < 1min
🔄 Frequency: Weekly (Monday 2 AM)
📊 Scale: Up to 50-100 notifications per run
💾 Storage: Audit logs + notification records
```

---

## 5. API Specification (OpenAPI)

### 5.1 Authentication & Authorization

**JWT Token Format:**
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "contador",
    "companies": ["company-uuid-1", "company-uuid-2"],
    "iat": 1707480000,
    "exp": 1707483600,
    "iss": "agente-tritutario.com"
  }
}
```

**Rate Limiting:**
- Public endpoints: 100 req/min per IP
- Authenticated endpoints: 1000 req/min per user
- Chat endpoint: 10 msg/min per user

### 5.2 Core Endpoints

#### **Authentication**

```
POST /api/v1/auth/register
├── Body:
│   {
│     "email": "entrepreneur@example.com",
│     "password": "SecurePass123!",
│     "name": "João Silva",
│     "role": "empresario"
│   }
├── Response 201:
│   {
│     "user": { "id": "uuid", "email": "...", "role": "..." },
│     "token": "eyJhbGc...",
│     "expiresIn": 3600
│   }
└── Errors: 400 (validation), 409 (email exists)

POST /api/v1/auth/login
├── Body:
│   { "email": "...", "password": "..." }
├── Response 200:
│   { "user": {...}, "token": "...", "expiresIn": 3600 }
└── Errors: 401 (invalid credentials)

POST /api/v1/auth/logout
├── Auth: Bearer token required
├── Response 200: { "message": "logged out" }
└── Errors: 401 (unauthorized)

POST /api/v1/auth/refresh
├── Body: { "refreshToken": "..." }
├── Response 200: { "token": "...", "expiresIn": 3600 }
└── Errors: 401 (token expired)
```

#### **Companies**

```
GET /api/v1/companies
├── Auth: Bearer token required
├── Query: ?limit=20&offset=0&status=active
├── Response 200:
│   {
│     "data": [
│       {
│         "id": "uuid",
│         "cnpj": "12.345.678/0001-95",
│         "name": "Empresa XYZ",
│         "cnae_code": "4110-2/04",
│         "current_regime": "SIMPLES",
│         "annual_revenue": 500000,
│         "created_at": "2026-02-09T10:00:00Z"
│       }
│     ],
│     "total": 5,
│     "limit": 20,
│     "offset": 0
│   }
└── Errors: 401 (unauthorized), 403 (forbidden)

POST /api/v1/companies
├── Auth: Bearer token required
├── Body:
│   {
│     "cnpj": "12345678000195",
│     "name": "New Company",
│     "annual_revenue": 750000
│   }
├── Response 201:
│   {
│     "data": { "id": "uuid", "cnpj": "...", ... },
│     "message": "Company created successfully"
│   }
└── Errors: 400 (validation), 409 (CNPJ exists)

GET /api/v1/companies/:id
├── Auth: Bearer token required
├── Response 200: { "data": {...} }
└── Errors: 404 (not found), 403 (forbidden)

PUT /api/v1/companies/:id
├── Auth: Bearer token required
├── RBAC: owner or manager role
├── Body: { "name": "...", "annual_revenue": ... }
├── Response 200: { "data": {...}, "message": "updated" }
└── Errors: 400, 403, 404
```

#### **Tax Analysis**

```
POST /api/v1/companies/:id/analysis
├── Auth: Bearer token required
├── Body: { "revenue_override": 1000000 } (optional)
├── Response 200:
│   {
│     "data": {
│       "company_id": "uuid",
│       "analysis_date": "2026-02-09",
│       "scenarios": [
│         {
│           "regime": "SIMPLES",
│           "total_tax_amount": 85000,
│           "effective_tax_rate": 8.5,
│           "breakdown": {
│             "income_tax": 0,
│             "social_contribution": 0,
│             "pis_cofins": 85000,
│             "inss": 0
│           }
│         },
│         {
│           "regime": "LUCRO_PRESUMIDO",
│           "total_tax_amount": 150000,
│           "effective_tax_rate": 15,
│           "breakdown": {...}
│         },
│         {
│           "regime": "LUCRO_REAL",
│           "total_tax_amount": 180000,
│           "effective_tax_rate": 18,
│           "breakdown": {...}
│         }
│       ],
│       "recommendation": {
│         "regime": "SIMPLES",
│         "reason": "Lowest tax burden for your revenue level",
│         "annual_savings_vs_current": 45000
│       }
│     }
│   }
└── Errors: 404 (company not found), 400 (validation)

GET /api/v1/companies/:id/analysis/history
├── Auth: Bearer token required
├── Query: ?limit=10&offset=0
├── Response 200:
│   {
│     "data": [
│       {
│         "id": "uuid",
│         "analysis_date": "2026-02-09",
│         "regime_then": "SIMPLES",
│         "regime_now": "LUCRO_PRESUMIDO",
│         "created_at": "2026-02-09T10:30:00Z"
│       }
│     ]
│   }
└── Errors: 404
```

#### **Chat API**

```
POST /api/v1/chat
├── Auth: Bearer token required
├── Body:
│   {
│     "content": "Qual o melhor regime para MEI?",
│     "conversation_id": "uuid" (optional),
│     "company_id": "uuid" (optional, for context)
│   }
├── Response 200 (streaming):
│   {
│     "conversation_id": "uuid",
│     "message_id": "uuid",
│     "content": "Como MEI, você está enquadrado no SIMPLES Nacional...",
│     "sources": [
│       {
│         "id": "doc-uuid",
│         "title": "Reforma Tributária - MEI Enquadramento",
│         "url": "https://...",
│         "relevance_score": 0.92
│       }
│     ],
│     "tokens_used": 245,
│     "created_at": "2026-02-09T11:00:00Z"
│   }
├── Rate Limit: 10 msg/min per user
└── Errors: 400 (invalid input), 429 (rate limited), 503 (service unavailable)

GET /api/v1/chat/:conversation_id
├── Auth: Bearer token required
├── Query: ?limit=50&offset=0
├── Response 200:
│   {
│     "data": {
│       "id": "uuid",
│       "created_at": "2026-02-09T10:00:00Z",
│       "messages": [
│         { "role": "user", "content": "...", "created_at": "..." },
│         { "role": "assistant", "content": "...", "sources": [...], "created_at": "..." }
│       ]
│     }
│   }
└── Errors: 404 (not found), 403 (forbidden)

POST /api/v1/chat/:message_id/feedback
├── Auth: Bearer token required
├── Body:
│   {
│     "rating": 5,
│     "is_helpful": true,
│     "feedback_text": "Resposta muito útil e precisa"
│   }
├── Response 201: { "data": {...}, "message": "feedback saved" }
└── Errors: 400, 404
```

#### **Notifications**

```
GET /api/v1/notifications
├── Auth: Bearer token required
├── Query: ?type=LEGISLATIVE&unread=true&limit=20
├── Response 200:
│   {
│     "data": [
│       {
│         "id": "uuid",
│         "type": "LEGISLATIVE",
│         "title": "Reforma Tributária - Novas Alíquotas SIMPLES",
│         "body": "As alíquotas do SIMPLES Nacional foram atualizadas...",
│         "is_read": false,
│         "published_at": "2026-02-08T02:00:00Z",
│         "expires_at": "2026-05-09T23:59:59Z"
│       }
│     ],
│     "unread_count": 3
│   }
└── Errors: 401

PATCH /api/v1/notifications/:id/read
├── Auth: Bearer token required
├── Response 200: { "data": {...}, "message": "marked as read" }
└── Errors: 404
```

#### **Admin Endpoints**

```
GET /api/v1/admin/users
├── Auth: Bearer token + role=admin
├── Query: ?role=contador&status=active&limit=50
├── Response 200: { "data": [...], "total": ... }
└── Errors: 401, 403 (unauthorized)

GET /api/v1/admin/analytics
├── Auth: Bearer token + role=admin
├── Response 200:
│   {
│     "data": {
│       "total_users": 1250,
│       "active_subscriptions": 840,
│       "mrr": 125000,
│       "chats_this_month": 45000,
│       "avg_response_time_ms": 1200,
│       "ragtop_queries": ["regime comparison", "CNPJ validation", ...]
│     }
│   }
└── Errors: 401, 403
```

### 5.3 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2026-02-09T11:30:00Z",
    "request_id": "req-uuid-12345"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409) — resource exists
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

---

## 6. Security & Compliance

### 6.1 Authentication

**Implementation:** NextAuth.js with JWT

```typescript
// nextauth.config.ts
export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // 1. Find user by email
        // 2. Verify password with bcrypt
        // 3. Return user object or null
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.companies = user.companies;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.role = token.role;
      session.user.companies = token.companies;
      return session;
    }
  }
};
```

### 6.2 Authorization (RBAC)

```typescript
// middleware/rbac.ts
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // from JWT middleware
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};

// usage in routes
router.get('/admin/users', requireRole(['admin']), AdminController.getUsers);
router.put('/companies/:id', requireRole(['contador', 'empresario']), CompanyController.update);
```

**Role Permissions Matrix:**

| Action | Admin | Contador | Empresário |
|--------|-------|----------|-----------|
| View own profile | ✅ | ✅ | ✅ |
| View all users | ✅ | ❌ | ❌ |
| Create company | ✅ | ✅ | ✅ |
| View own company | ✅ | ✅ | ✅ |
| View counter's companies | ✅ | ✅ | ❌ |
| Edit company | ✅ | ✅* | ✅* |
| Send alert to client | ✅ | ✅ | ❌ |
| View notifications | ✅ | ✅ | ✅ |
| Access admin panel | ✅ | ❌ | ❌ |

*owner/manager role required

### 6.3 Data Encryption

**In Transit:**
- TLS 1.3+ for all connections
- HTTPS enforcement (HSTS header)
- Certificate pinning (optional for mobile)

**At Rest:**
```typescript
// encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key

export function encryptSensitiveData(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decryptSensitiveData(ciphertext: string): string {
  const parts = ciphertext.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// usage in services
await prisma.company.create({
  data: {
    cnpj: encryptSensitiveData(cnpj),
    annual_revenue: encryptSensitiveData(String(revenue)),
    // ...
  }
});
```

**Encrypted Fields:**
- `users.email` (searchable: hash for index)
- `companies.cnpj`
- `companies.annual_revenue`
- `receipt_classifications.amount`

### 6.4 Input Validation

```typescript
// validators.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password must be 8+ chars")
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/[0-9]/, "Must include number")
    .regex(/[!@#$%]/, "Must include special char"),
  name: z.string().min(2).max(255),
  role: z.enum(['admin', 'contador', 'empresario'])
});

export const cnpjSchema = z.string()
  .regex(/^\d{14}$/, "CNPJ must be 14 digits")
  .refine(validateCNPJ, "Invalid CNPJ checksum");

// Middleware application
router.post('/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }
  // process...
});
```

### 6.5 LGPD Compliance

**Data Subject Rights:**
1. **Right to Access** — User can download their data
2. **Right to Rectification** — User can correct data
3. **Right to Erasure** — User can request complete deletion (soft + hard delete after 90 days)
4. **Right to Data Portability** — User can export data in standard format

**Implementation:**
```typescript
// gdpr-service.ts
export async function getUserData(userId: UUID): Promise<object> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const companies = await prisma.company.findMany({
    where: { company_users: { some: { user_id: userId } } }
  });
  const chats = await prisma.chat_history.findMany({
    where: { user_id: userId }
  });

  return {
    user: user,
    companies: companies,
    chat_history: chats,
    // ... all user data
  };
}

export async function deleteUserData(userId: UUID): Promise<void> {
  // Soft delete: set deleted_at timestamp
  await prisma.user.update({
    where: { id: userId },
    data: { deleted_at: new Date() }
  });

  // Schedule hard delete after 90 days
  await scheduleHardDelete(userId, 90); // days
}
```

**Audit Logging:**
- All sensitive operations logged to `audit_logs` table
- Retained for 2 years (LGPD requirement)
- Includes: user, action, timestamp, IP, user-agent

### 6.6 Rate Limiting & DDoS Protection

```typescript
// rate-limiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const redisClient = createRedisClient();

export const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many requests, please try again later'
});

export const chatLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:chat:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages
  keyGenerator: (req) => req.user.id // per-user rate limit
});

// Apply to routes
app.post('/api/v1/chat', chatLimiter, ChatController.sendMessage);
```

---

## 7. Deployment & Infrastructure

### 7.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CDN (Cloudflare)                      │
│  - Static assets (images, CSS, JS)                      │
│  - DDoS protection                                      │
│  - Geographic distribution                             │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
  ┌─────▼─────┐   ┌─────▼──────┐   ┌──▼──────────┐
  │  Vercel   │   │  Vercel    │   │   Vercel   │
  │ Serverless│   │ Edge       │   │ Functions  │
  │  Functions│   │ Middleware │   │ (API)      │
  │(Frontend) │   │            │   │(apps/api)  │
  └───────────┘   └────────────┘   └────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
  ┌─────▼──────────────────────────────▼──────┐
  │              Railway.app                   │
  │  PostgreSQL 15 + Redis 7 cluster          │
  │  - Automated backups (daily)              │
  │  - Point-in-time recovery (7 days)        │
  │  - Replicas for read scaling              │
  └──────────────────────────────────────────┘
        │               │
        ▼               ▼
   ┌─────────┐    ┌──────────────┐
   │PostgreSQL     │  Redis 7     │
   │  Prod DB      │  Cache       │
   │  100GB+ SSD   │  Job Queue   │
   └─────────┘    └──────────────┘
```

### 7.2 Environment Configuration

**.env.example:**
```bash
# Backend
API_PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/agente_tritutario
REDIS_URL=redis://user:pass@host:6379

# Frontend
NEXT_PUBLIC_API_URL=https://api.agente-tritutario.com

# Auth
NEXTAUTH_SECRET=<64-char random string>
NEXTAUTH_URL=https://agente-tritutario.com

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# External Services
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

PINECONE_API_KEY=...
PINECONE_INDEX=agente-tributario-prod
PINECONE_ENVIRONMENT=us-west-2

STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@agente-tritutario.com

# Encryption
ENCRYPTION_KEY=<64-hex-char key>

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://...
```

### 7.3 Database Migration Strategy

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Migration workflow
// 1. Create schema changes
// 2. Run: npx prisma migrate dev --name add_new_table
// 3. Review generated SQL in prisma/migrations/
// 4. Test migrations locally
// 5. Run: npx prisma migrate deploy (production)

// Backup before migrations
// BACKUP: pg_dump agente_tritutario > backup-$(date +%s).sql
```

### 7.4 CI/CD Pipeline

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (Frontend)
        run: |
          npm install -g vercel
          vercel deploy --prod \
            --token ${{ secrets.VERCEL_TOKEN }} \
            --env NODE_ENV=production

      - name: Deploy to Railway (Backend)
        run: |
          npm install -g railway
          railway up --token ${{ secrets.RAILWAY_TOKEN }}

      - name: Run Migrations
        run: |
          npx prisma migrate deploy

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Deployment successful",
              "blocks": [{"type": "section", "text": {"type": "mrkdwn", "text": "*Agente Tritutario* deployed to production"}}]
            }
```

### 7.5 Monitoring & Observability

```typescript
// sentry integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
  ],
});

// Custom metrics
export function trackMetric(name: string, value: number, tags?: Record<string, string>) {
  Sentry.captureMessage(`metric:${name}=${value}`, { level: 'info', tags });
}

// Usage
trackMetric('chat_response_time_ms', responseTime, { model: 'gpt-4o' });
trackMetric('rag_search_latency_ms', ragLatency, { docs_returned: String(docs.length) });
```

---

## 8. Risk Analysis & Mitigations

### 8.1 HIGH Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **RAG Relevancy** (wrong docs returned) | High | High | Implement relevance threshold (0.7), user feedback loop, quarterly audits |
| **OpenAI API Costs Escalate** | High | High | Rate limiting (10 msg/min), caching embeddings, batch processing, cost monitoring dashboard |
| **CNPJ API Unavailable** | Medium | High | Fallback to manual entry, cache company data, retry with exponential backoff |
| **Performance Under Load** (100+ req/s) | Medium | High | Load testing weekly, Redis caching, database query optimization, CDN for static assets |

### 8.2 MEDIUM Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Notification Overload** | Medium | Medium | Queue-based delivery (Bull), batching, user preference settings |
| **Database Migration Issues** | Low | High | Test migrations in staging, backup before deploy, rollback procedure |
| **UX/Dev Misalignment** | Medium | Medium | Design spec + component library, code review, weekly sync |
| **Data Leakage** (encryption keys) | Low | Critical | Rotate keys quarterly, access control, audit logs, VPN for access |

---

## 9. Performance & Scalability

### 9.1 Performance Targets (NFR2: < 2 seconds)

**Dashboard Load:** Target < 1 second
- Frontend: < 500ms (next.js static optimization, image optimization)
- Backend query: < 300ms (indexed queries, Redis cache)
- Network: < 200ms (CDN, geographic proximity)

**Chat Response:** Target < 5 seconds
- RAG search: < 400ms (Pinecone vector index)
- LLM generation: < 4s (streaming response)

**Tax Analysis:** Target < 1 second
- Database query: < 200ms (indexed CNPJ, regime lookups)
- Calculation: < 100ms (in-memory, cached rules)
- Response: < 700ms (network latency)

### 9.2 Caching Strategy

```typescript
// Redis Cache Layers
const cacheConfig = {
  // Layer 1: User Session (1 hour)
  userSession: 3600,

  // Layer 2: Company Data (7 days)
  companyData: 7 * 24 * 3600,

  // Layer 3: Tax Regime Rules (30 days)
  taxRegimeRules: 30 * 24 * 3600,

  // Layer 4: RAG Documents (90 days, invalidate on update)
  ragDocuments: 90 * 24 * 3600,

  // Layer 5: Chat Embeddings (Forever, manual invalidate)
  chatEmbeddings: null,
};

// Cache invalidation on updates
function invalidateCache(key: string) {
  redis.del(key);
  // Publish to other instances
  redis.publish('cache:invalidate', key);
}
```

### 9.3 Database Optimization

**Indexes:**
```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- Company queries
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_cnae ON companies(cnae_code);
CREATE INDEX idx_company_users_user ON company_users(user_id);
CREATE INDEX idx_company_users_role ON company_users(role);

-- Chat queries
CREATE INDEX idx_chat_user_conversation ON chat_history(user_id, conversation_id);
CREATE INDEX idx_chat_created_at ON chat_history(created_at DESC);

-- Audit logs
CREATE INDEX idx_audit_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_retention ON audit_logs(created_at)
  WHERE created_at > now() - interval '2 years';
```

**Query Optimization:**
- Avoid SELECT * (only fetch needed columns)
- Use pagination (limit 50, offset)
- Batch operations (insert multiple rows)
- N+1 query prevention (use JOINs, dataloader)

### 9.4 Horizontal Scalability

**Stateless Design:**
- No session storage on server (JWT in client)
- Redis for distributed cache
- Bull for job queue (workers scale independently)
- Read replicas for PostgreSQL (read-heavy workloads)

**Auto-Scaling (Cloud Providers):**
```yaml
# Railway auto-scaling
services:
  api:
    replicas:
      min: 2
      max: 10
      target_cpu: 70%
      target_memory: 80%

  worker:
    replicas:
      min: 1
      max: 5
      target_queue_length: 100
```

---

## 10. Appendix

### 10.1 Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 16+ | SSR, SEO, Edge Functions |
| **Frontend State** | Zustand | Lightweight, easy to test |
| **Styling** | Tailwind CSS | Utility-first, rapid development |
| **Backend** | Express.js | Lightweight, large ecosystem |
| **ORM** | Prisma | Type-safe, auto-migrations |
| **Database** | PostgreSQL 15+ | ACID, JSON support, scalable |
| **Caching** | Redis 7+ | Fast, distributed, job queue |
| **Vector DB** | Pinecone | Managed, production-ready |
| **Auth** | NextAuth.js + JWT | Flexible, secure |
| **LLM** | OpenAI GPT-4o | Best-in-class performance |
| **Job Queue** | Bull | Redis-backed, reliable |
| **Logging** | Winston | Structured, flexible |
| **Error Tracking** | Sentry | Production monitoring |
| **Deployment** | Vercel + Railway | Easy scaling, managed services |
| **Email** | Resend | Developer-friendly API |
| **Payment** | Stripe | Market-leading PCI compliance |

### 10.2 Architecture Decisions Log

**Decision 1: Monorepo vs. Multi-repo**
- ✅ **Chosen:** Monorepo (Turborepo)
- **Rationale:** Code sharing, atomic deployments, easier refactoring

**Decision 2: REST vs. GraphQL**
- ✅ **Chosen:** REST API v1
- **Rationale:** Simpler for this team, easier caching, good enough for 100 req/s

**Decision 3: NextAuth.js JWT vs. Sessions**
- ✅ **Chosen:** JWT (stateless)
- **Rationale:** Horizontal scalability, no session store needed

**Decision 4: Application-Level vs. Database Encryption**
- ✅ **Chosen:** Hybrid (database constraints + app-level for sensitive fields)
- **Rationale:** Balance between security and queryability

**Decision 5: Single Database vs. CQRS**
- ✅ **Chosen:** Single PostgreSQL (read replicas for scale)
- **Rationale:** Sufficient for projected scale, simpler architecture

### 10.3 Related Documents

- [PRD](./prd.md) — Product requirements
- [Team Coordination](./team-coordination.md) — Development schedule
- [DASHBOARD](./DASHBOARD.md) — Real-time progress
- [Story 1.1](./stories/story-1.1.md) — Project setup

---

**Architecture Document Status:** 🟡 **IN PROGRESS**

**Next Sections (Being Written):**
- ✅ ER Diagram (complete)
- ✅ Component Architecture (complete)
- ✅ Data Flow Diagrams (complete)
- ✅ API Specification (complete)
- ✅ Security & Compliance (complete)
- ✅ Deployment & Infrastructure (complete)
- ✅ Risk Analysis & Mitigations (complete)
- ✅ Performance & Scalability (complete)

**Last Updated:** Feb 9, 2026 — 18:30 UTC-3
**Architect:** Aria (System Architect)
**Status:** Ready for team review & feedback

---

— Aria, arquitetando o futuro 🏗️
