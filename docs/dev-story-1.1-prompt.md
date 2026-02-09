# Task para @dev — Story 1.1: Project Setup, CI/CD, e Estrutura Base

**De:** Morgan (PM)
**Para:** @dev
**Data:** 2026-02-09
**Story:** 1.1 (Epic 1 — Foundation & Core Infrastructure)
**Status:** ✅ Pronto para Desenvolvimento
**Estimativa:** 2-3 dias (solo dev)

---

## Contexto

Este é o **primeiro story de Epic 1** — a fundação técnica do Agente Tributário. Sem este story, nada mais funciona. Seu objetivo é criar um projeto estruturado com CI/CD pronto, permitindo que futuros stories façam deploy seguro e iterativo.

**Resultado esperado:** Um repositório funcional com monorepo, Next.js frontend, Node.js API, ESLint, Prettier, Jest, GitHub Actions, e ambiente local pronto com Docker Compose.

---

## Acceptance Criteria (Do PRD)

Você deve completar TODOS os 10 critérios:

1. ✅ Repositório monorepo criado no GitHub com Turborepo configurado
2. ✅ Estrutura de pastas implementada: `apps/web`, `apps/api`, `packages/shared`, `packages/rag`, `packages/ai-agent`
3. ✅ Next.js 16+ configurado em `apps/web` com TypeScript e Tailwind CSS
4. ✅ Node.js + Express (ou Next.js API routes) configurado em `apps/api`
5. ✅ GitHub Actions configurado com pipeline de: lint → type-check → test → deploy (staging)
6. ✅ Variáveis de ambiente configuradas (.env.example, .env.local, .env.production)
7. ✅ Docker Compose (opcional) para desenvolvimento local com PostgreSQL + Redis
8. ✅ README.md com instruções de setup e desenvolvimento
9. ✅ Linting (ESLint) e formatting (Prettier) configurados e rodando em CI/CD
10. ✅ Testes unitários básicos rodam com sucesso (Jest configurado)

---

## Tecnologia & Ferramentas Recomendadas

### Monorepo & Build Tool
- **Turborepo** (recomendado, mais leve que Nx)
- Package manager: **npm** (ou yarn/pnpm se preferir)
- Node.js version: **18.17+** ou **20+**

### Frontend (apps/web)
- **Next.js 16+** (com App Router)
- **React 19+**
- **TypeScript**
- **Tailwind CSS 3+**
- **Zustand** (state management)

### Backend (apps/api)
- **Node.js 20+**
- **Express** (simples) OU **Next.js API routes** (integrado)
- **Recommendation:** Express for clarity, ou Next.js API routes para menos boilerplate
- **TypeScript**

### Shared Packages
- `packages/shared` — Types, utils, constants
- `packages/rag` — RAG/vector DB utilities (preparação para Story 1.5)
- `packages/ai-agent` — AI agent utilities (preparação para Epic 4)

### Code Quality
- **ESLint** (linting)
- **Prettier** (formatting)
- **TypeScript** (type checking)
- **Jest** (unit testing)
- **Testing Library** (React component testing)

### CI/CD
- **GitHub Actions** (workflows)
- **Pre-commit hooks** (optional, but nice to have)

### Development
- **Docker Compose** (optional, but recommended for postgres + redis)
- **.env files** for local development

---

## Tarefas Detalhadas

### Fase 1: Setup Inicial (Day 1)

#### 1.1.1 Criar Repositório GitHub

```bash
# Create repo on GitHub with:
# - Repository name: agente-tributario
# - Description: "IA-powered platform for Brazilian tax guidance (Reforma Tributária)"
# - Public or Private (up to you)
# - Initialize with: .gitignore (Node.js), License (MIT)
# - No README yet (will create custom one)

git clone https://github.com/YOUR_USERNAME/agente-tributario.git
cd agente-tributario
```

**Deliverable:**
- [ ] Repositório criado e clonado localmente
- [ ] .gitignore configurado para Node.js

---

#### 1.1.2 Configurar Turborepo Monorepo

```bash
# Initialize Turborepo
npx create-turbo@latest .

# This will create:
# - turbo.json (Turborepo config)
# - root package.json
# - apps/ and packages/ folders

# Remove default apps/docs (não precisa)
rm -rf apps/docs

# Keep: apps/web (frontend), apps/api (backend)
```

**Expected structure after this step:**

```
agente-tributario/
├── apps/
│   ├── web/           (Next.js frontend)
│   ├── api/           (Node.js backend)
├── packages/
│   ├── ui/            (shared UI components - can rename to shared)
│   ├── eslint-config/ (shared ESLint config)
│   ├── tsconfig/      (shared TypeScript config)
├── turbo.json
├── package.json
├── pnpm-workspace.yaml (or package-lock.json)
└── .gitignore
```

**Deliverable:**
- [ ] Turborepo initialized
- [ ] apps/web and apps/api folders exist
- [ ] Root package.json with workspaces configured
- [ ] turbo.json with build/lint/test tasks

---

### Fase 2: Configure Frontend (Day 1-2)

#### 1.1.3 Setup Next.js Frontend (apps/web)

```bash
# Navigate to apps/web (should already exist from create-turbo)
cd apps/web

# If not, create:
# npx create-next-app@latest . --typescript --tailwind

# Ensure:
# - Next.js 16+
# - TypeScript ✓
# - Tailwind CSS ✓
# - App Router ✓
# - ESLint ✓

# Update package.json in apps/web:
# Add scripts:
# "dev": "next dev -p 3000"
# "build": "next build"
# "start": "next start"
# "lint": "next lint"
# "type-check": "tsc --noEmit"

# Create basic pages:
# - app/page.tsx (home/login)
# - app/dashboard/page.tsx (placeholder)
# - app/api/health.ts (health check)
```

**Basic folder structure in apps/web:**

```
apps/web/
├── app/
│   ├── layout.tsx       (root layout)
│   ├── page.tsx         (login/home)
│   ├── dashboard/
│   │   └── page.tsx     (dashboard placeholder)
│   ├── api/
│   │   └── health.ts    (health check endpoint)
├── components/
│   └── (empty for now, placeholder)
├── lib/
│   └── (utilities, hooks, etc.)
├── public/
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── .env.example
```

**Deliverable:**
- [ ] Next.js 16+ configured
- [ ] TypeScript ✓
- [ ] Tailwind CSS ✓
- [ ] App Router ✓
- [ ] Basic pages created
- [ ] app/api/health.ts working

---

#### 1.1.4 Setup Backend API (apps/api)

**Choose ONE approach:**

**Option A: Next.js API Routes** (simpler, integrated)
```bash
# Use api folder in Next.js apps/web
# Routes: /api/v1/auth/login, /api/v1/companies, etc.
# Pros: Integrated, simpler deploy
# Cons: Less separation, harder to scale later
```

**Option B: Express Server** (clearer separation, recommended)
```bash
# Create apps/api with Express

cd ../api
npm init -y
npm install express typescript ts-node @types/express @types/node dotenv cors

# Create folder structure:
apps/api/
├── src/
│   ├── index.ts         (express server entry)
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   ├── routes/
│   │   ├── health.ts    (GET /health)
│   │   ├── auth.ts      (POST /api/v1/auth/login, etc.)
│   │   ├── companies.ts (GET /api/v1/companies, etc.)
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── companyController.ts
│   ├── services/
│   │   ├── (business logic)
├── package.json
├── tsconfig.json
└── .env.example

# Update package.json scripts:
# "dev": "ts-node src/index.ts"
# "build": "tsc"
# "start": "node dist/index.js"
# "lint": "eslint src"
# "type-check": "tsc --noEmit"
```

**Basic Express Server (src/index.ts):**

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API v1
app.get('/api/v1/status', (req, res) => {
  res.json({ status: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**My Recommendation:** Use Express for clarity and separation. You can always refactor to Next.js API routes later if needed.

**Deliverable:**
- [ ] Backend server running on port 3001
- [ ] GET /health returns 200 OK
- [ ] GET /api/v1/status returns JSON
- [ ] TypeScript configured
- [ ] Basic folder structure (src/routes, src/controllers, src/services)

---

### Fase 3: Shared Packages (Day 2)

#### 1.1.5 Create Shared Packages

```bash
# Rename default 'ui' package to 'shared'
# Inside packages/shared:

packages/shared/
├── src/
│   ├── types/
│   │   ├── index.ts     (export types)
│   │   ├── user.ts      (User, Admin, Contador, Empresario)
│   │   ├── company.ts   (Company, Branch, etc.)
│   ├── utils/
│   │   ├── index.ts
│   │   ├── validation.ts
│   ├── constants/
│   │   ├── index.ts
│   │   ├── regimes.ts   (Simples, Presumido, Real constants)
├── package.json
├── tsconfig.json

# Create TypeScript types (types/user.ts):
export type UserRole = 'admin' | 'contador' | 'empresario';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface Empresa {
  id: string;
  cnpj: string;
  razaoSocial: string;
  regime: 'simples' | 'presumido' | 'real';
  uf: string;
  cnae: string;
}
```

**Create placeholder packages:**
- `packages/rag` — empty for now (Story 1.5)
- `packages/ai-agent` — empty for now (Epic 4)

**Deliverable:**
- [ ] packages/shared configured
- [ ] Basic types exported (User, Company, etc.)
- [ ] packages/rag and packages/ai-agent created (empty)
- [ ] Shared package can be imported by apps/web and apps/api

---

### Fase 4: Code Quality Tools (Day 2-3)

#### 1.1.6 Configure ESLint & Prettier

**Root level ESLint config (.eslintrc.json):**

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error"
  },
  "overrides": [
    {
      "files": ["apps/api/**"],
      "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"]
    }
  ]
}
```

**Root level Prettier config (.prettierrc):**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Update root package.json scripts:**

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "format": "prettier --write ."
  }
}
```

**Verify:**

```bash
npm run lint      # Should pass (or show fixable issues)
npm run format    # Run Prettier
npm run type-check # Should pass
```

**Deliverable:**
- [ ] ESLint configured and running
- [ ] Prettier configured and running
- [ ] Root npm scripts work (lint, format, type-check)

---

#### 1.1.7 Configure Jest & Testing

**Root level jest.config.js:**

```javascript
module.exports = {
  projects: [
    '<rootDir>/apps/web/jest.config.js',
    '<rootDir>/apps/api/jest.config.js',
    '<rootDir>/packages/shared/jest.config.js',
  ],
};
```

**apps/web/jest.config.js:**

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

module.exports = createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
});
```

**apps/api/jest.config.js:**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
```

**Create basic tests:**

**apps/web/src/__tests__/example.test.tsx:**

```typescript
describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

**apps/api/src/__tests__/health.test.ts:**

```typescript
describe('Health Check', () => {
  it('should return ok status', () => {
    const result = { status: 'ok' };
    expect(result.status).toBe('ok');
  });
});
```

**Verify:**

```bash
npm test          # Should run all tests and pass
npm run test -- --coverage  # Show coverage (optional)
```

**Deliverable:**
- [ ] Jest configured
- [ ] Basic tests exist and pass
- [ ] npm test runs successfully
- [ ] Coverage goal: 0% for now (will improve in future stories)

---

### Fase 5: CI/CD & GitHub Actions (Day 2-3)

#### 1.1.8 Configure GitHub Actions

**Create .github/workflows/ci.yml:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

**Create .github/workflows/deploy.yml (optional, for later):**

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (Frontend)
        run: echo "Deploy frontend to Vercel (manual setup)"
      - name: Deploy to Railway (Backend)
        run: echo "Deploy backend to Railway (manual setup)"
```

**Deliverable:**
- [ ] .github/workflows/ci.yml created
- [ ] Lint, type-check, test, build steps configured
- [ ] GitHub Actions runs automatically on push/PR
- [ ] All checks pass

---

#### 1.1.9 Environment Variables

**Create .env.example in root:**

```bash
# Frontend (apps/web/.env.example)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Agente Tributário

# Backend (apps/api/.env.example)
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/agente_tributario
REDIS_URL=redis://localhost:6379

# Shared
LOG_LEVEL=info
```

**Create .env.local files (git-ignored):**

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/api/.env.local
PORT=3001
DATABASE_URL=postgresql://localhost/agente_tributario_dev
REDIS_URL=redis://localhost:6379
```

**Ensure .gitignore includes:**

```bash
.env
.env.local
.env.*.local
```

**Deliverable:**
- [ ] .env.example in root and each app
- [ ] .env.local created locally (git-ignored)
- [ ] Apps read env vars correctly
- [ ] No secrets in git

---

### Fase 6: Docker Compose & Development Setup (Day 3)

#### 1.1.10 Docker Compose (Optional but Recommended)

**Create docker-compose.yml in root:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: agente_user
      POSTGRES_PASSWORD: agente_password
      POSTGRES_DB: agente_tributario
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

**Create Makefile (optional, for convenience):**

```makefile
.PHONY: help dev lint test build clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make dev         - Start development servers"
	@echo "  make lint        - Run linter"
	@echo "  make test        - Run tests"
	@echo "  make build       - Build production"
	@echo "  make docker-up   - Start Docker containers"
	@echo "  make docker-down - Stop Docker containers"

dev:
	npm run dev

lint:
	npm run lint

test:
	npm test

build:
	npm run build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules dist
```

**Usage:**

```bash
make docker-up
npm run dev
# Open http://localhost:3000 (frontend)
# Open http://localhost:3001 (backend)
```

**Deliverable:**
- [ ] docker-compose.yml configured
- [ ] PostgreSQL container running
- [ ] Redis container running
- [ ] Local development can use Docker (optional)

---

### Fase 7: Documentation (Day 3)

#### 1.1.11 Create Comprehensive README.md

**Create README.md in root with:**

```markdown
# Agente Tributário

IA-powered platform for Brazilian tax guidance (Reforma Tributária).

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand
- **Backend:** Express, TypeScript
- **Database:** PostgreSQL
- **Cache:** Redis
- **Testing:** Jest, Testing Library
- **Linting:** ESLint, Prettier
- **Monorepo:** Turborepo

## Project Structure

```
agente-tributario/
├── apps/
│   ├── web/           Next.js frontend
│   ├── api/           Express backend
├── packages/
│   ├── shared/        Shared types, utils, constants
│   ├── rag/           RAG system (future)
│   ├── ai-agent/      AI agent utilities (future)
├── .github/workflows/ CI/CD pipelines
└── docker-compose.yml PostgreSQL + Redis
```

## Setup

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker (optional, for local database)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/agente-tributario.git
cd agente-tributario

# Install dependencies
npm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local

# Start Docker (optional)
docker-compose up -d

# Start development servers
npm run dev
```

### Access

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/health

## Development

### Available Commands

```bash
npm run dev          # Start all dev servers
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type check
npm test             # Run tests
```

### Project Structure

Frontend (apps/web):
- `app/` — Next.js pages and layouts
- `components/` — React components
- `lib/` — Utilities, hooks
- `public/` — Static assets

Backend (apps/api):
- `src/routes/` — API endpoints
- `src/controllers/` — Business logic
- `src/services/` — Data access
- `src/middleware/` — Auth, error handling

Shared (packages/shared):
- `src/types/` — TypeScript types
- `src/utils/` — Shared utilities
- `src/constants/` — Constants

## CI/CD

GitHub Actions automatically:
- Lint on push
- Type check
- Run tests
- Build

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "feat: my feature"`
3. Push: `git push origin feature/my-feature`
4. Open PR

## License

MIT
```

**Deliverable:**
- [ ] README.md created with:
  - Tech stack overview
  - Project structure
  - Setup instructions
  - Development commands
  - CI/CD overview
  - Contributing guidelines

---

## Acceptance Criteria Verification Checklist

Before marking this story as DONE, verify ALL 10 criteria:

- [ ] 1. Repositório monorepo criado no GitHub com Turborepo configurado
- [ ] 2. Estrutura de pastas: apps/web, apps/api, packages/shared, packages/rag, packages/ai-agent
- [ ] 3. Next.js 16+ em apps/web com TypeScript e Tailwind CSS
- [ ] 4. Node.js + Express em apps/api com TypeScript
- [ ] 5. GitHub Actions: lint → type-check → test → build
- [ ] 6. Variáveis de ambiente (.env.example, .env.local, .env.production)
- [ ] 7. Docker Compose com PostgreSQL + Redis (opcional mas recomendado)
- [ ] 8. README.md com instruções de setup e desenvolvimento
- [ ] 9. ESLint + Prettier configurados e rodam em CI/CD
- [ ] 10. Jest configurado, testes básicos passam

---

## Testing This Story

### Local Testing

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Type check
npm run type-check

# Run tests
npm test

# Start dev servers
npm run dev

# Verify frontendworks
curl http://localhost:3000

# Verify backend works
curl http://localhost:3001/health
```

### CI/CD Testing

1. Push to GitHub
2. Check GitHub Actions → should see:
   - ✓ Lint job passed
   - ✓ Type-check job passed
   - ✓ Test job passed
   - ✓ Build job passed

---

## Known Issues & Workarounds

**Issue:** Next.js dev server doesn't hot-reload on Windows
- **Workaround:** Run `npm run dev` with `WATCHPACK_POLLING=true`

**Issue:** PostgreSQL connection fails locally
- **Workaround:** Check docker-compose.yml credentials match .env.local

**Issue:** Port 3000 or 3001 already in use
- **Workaround:** Change PORT in .env.local or kill process

---

## Next Steps (After This Story)

Once Story 1.1 is complete, the following stories can start:

- **Story 1.2:** Database Schema (depends on Story 1.1)
- **Story 1.3:** Authentication (depends on Story 1.1)
- **Story 1.4:** CNPJ Onboarding (depends on Story 1.1)
- **Story 1.5:** RAG Base (depends on Story 1.1)

---

## Resources & References

- **Turborepo Docs:** https://turbo.build/repo/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Express Docs:** https://expressjs.com/
- **ESLint:** https://eslint.org/
- **Jest:** https://jestjs.io/
- **GitHub Actions:** https://docs.github.com/en/actions

---

## Questions?

- PRD: `docs/prd.md`
- Architecture: `docs/architect-prompt.md`
- Contact PM (Morgan) for clarification

---

**Story Status: 🟢 READY FOR DEVELOPMENT**

Begin with Phase 1, proceed sequentially. Good luck! 🚀

