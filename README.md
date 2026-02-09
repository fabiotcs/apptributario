# 🏛️ Agente Tritutario

**AI-powered platform for Brazilian tax guidance during the Reforma Tributária**

[![CI Status](https://github.com/yourusername/agente-tritutario/workflows/CI/badge.svg)](https://github.com/yourusername/agente-tritutario/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Project Overview

Agente Tritutario is a SaaS platform that helps Brazilian entrepreneurs (MEIs, PJs) and accountants understand and navigate the Reforma Tributária (2025-2027).

**Key Features:**
- 🤖 AI-powered tax guidance chatbot
- 📊 Interactive tax impact analysis
- 👥 Portfolio management for accountants
- 📱 Responsive design (mobile-first)
- 🔐 LGPD-compliant data handling
- 💳 Subscription management

---

## 🚀 Quick Start

### Prerequisites
- **Node.js:** 18.17+ or 20+ (verify: `node --version`)
- **npm/yarn/pnpm:** (verify: `npm --version`)
- **Docker (optional):** For local database services

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/agente-tritutario.git
cd agente-tritutario

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Start development servers (frontend + backend)
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** `curl http://localhost:3001/health`

---

## 📁 Folder Structure

```
agente-tributario/
├── apps/
│   ├── web/                 # Next.js 16+ frontend
│   │   ├── app/            # App Router pages
│   │   ├── components/      # React components
│   │   ├── public/          # Static assets
│   │   ├── __tests__/       # Component tests
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                 # Node.js Express backend
│       ├── src/
│       │   ├── server.ts    # Express entry point
│       │   ├── routes/      # API endpoints
│       │   ├── middleware/  # Express middleware
│       │   └── utils/       # Utilities
│       ├── __tests__/       # Integration tests
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/              # Shared types & utilities
│   │   ├── src/
│   │   │   ├── types/      # TypeScript interfaces
│   │   │   ├── utils/      # Shared functions
│   │   │   └── constants/  # Constants
│   │   └── package.json
│   │
│   ├── rag/                 # RAG (vector search) utilities
│   │   ├── src/
│   │   └── package.json
│   │
│   └── ai-agent/            # AI agent utilities
│       ├── src/
│       └── package.json
│
├── docs/
│   ├── prd.md              # Product Requirements Document
│   ├── ARCHITECTURE.md      # System architecture
│   ├── stories/            # Development stories
│   └── DASHBOARD.md         # Development progress dashboard
│
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       └── ci.yml
│
├── docker-compose.yml       # Local dev environment
├── turbo.json              # Turborepo configuration
├── tsconfig.json           # TypeScript root config
├── .eslintrc.json          # ESLint rules
├── .prettierrc              # Code formatting rules
├── jest.config.js          # Test configuration
└── package.json            # Root workspace config
```

---

## 🛠️ Development Commands

### General Commands

```bash
# Install all dependencies
npm install

# Start development (frontend + backend together)
npm run dev

# Build all packages for production
npm run build

# Run all tests
npm test

# Run linting checks
npm run lint

# Format code with Prettier
npm run format

# Type check all TypeScript
npm run typecheck

# Clean all build artifacts
npm run clean
```

### Per-Package Commands

```bash
# Frontend only
cd apps/web
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm test             # Run component tests

# Backend only
cd apps/api
npm run dev          # Start Express server
npm run build        # Build API
npm test             # Run API tests

# Shared packages
cd packages/shared
npm test             # Run utility tests
```

---

## 🧪 Testing

```bash
# Run all tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.test.ts

# Run tests for specific package
cd apps/web
npm test
```

**Coverage Target:** > 80% across all packages

---

## 🔒 Environment Variables

Create `.env.local` in the root (use `.env.example` as template):

```bash
# Backend
API_PORT=3001
API_HOST=localhost
DATABASE_URL=postgresql://dev:devpass@localhost:5432/agente_tributario
REDIS_URL=redis://localhost:6379

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# External APIs
OPENAI_API_KEY=sk-...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Environment
NODE_ENV=development
```

---

## 🐳 Docker Development Setup

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Cleanup volumes (CAUTION: deletes data)
docker-compose down -v
```

---

## 📚 Technology Stack

### Frontend (apps/web)
- **Next.js 16+** - React framework with SSR/SSG
- **React 19+** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Zod** - Schema validation

### Backend (apps/api)
- **Node.js 20+** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database
- **PostgreSQL 15+** - Primary database
- **Redis 7+** - Caching & job queue
- **Bull** - Job scheduling
- **Winston** - Logging

### Shared
- **TypeScript** - Shared types
- **Zod** - Validation schemas
- **Pinecone/Weaviate** - Vector database (RAG)
- **OpenAI GPT-4o** - AI model

### DevOps & Quality
- **Turborepo** - Monorepo orchestration
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Docker & Docker Compose** - Containerization

---

## 📋 Git Workflow

### Branch Strategy

```
main
├─ develop (staging)
│  ├─ feature/1.1-project-setup
│  ├─ feature/1.2-database
│  └─ feature/...
└─ hotfix/...
```

### Commit Convention

```bash
feat: add authentication flow
fix: resolve database connection issue
docs: update architecture diagram
chore: update dependencies
test: add unit tests for auth module
```

---

## ✅ Quality Standards

### Before Committing

```bash
# Run all checks
npm run lint       # Should have 0 errors
npm run typecheck  # Should have 0 errors
npm test           # All tests should pass
npm run build      # Should build without errors
```

### Pre-commit Hooks (Optional)

```bash
npm install husky --save-dev
npx husky install
```

---

## 🚀 Deployment

### Staging (Next.js on Vercel + API on Railway)

```bash
# Push to develop branch
git push origin develop

# GitHub Actions CI/CD runs automatically
# Check Actions tab for pipeline status
```

### Production

```bash
# Create release on GitHub
# GitHub Actions deploys to production
# Frontend: Vercel
# Backend: Railway
```

---

## 📖 Documentation

- **[Architecture](./docs/ARCHITECTURE.md)** - System design and component overview
- **[PRD](./docs/prd.md)** - Product requirements and feature specifications
- **[Stories](./docs/stories/)** - Development task specifications
- **[Dashboard](./docs/DASHBOARD.md)** - Real-time progress tracking
- **[CONTRIBUTING](./CONTRIBUTING.md)** - Contribution guidelines

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Node Modules Issues

```bash
# Clear cache and reinstall
npm run clean
npm install
```

### TypeScript Errors

```bash
# Full type check
npm run typecheck

# Look for "any" types
grep -r ": any" src/
```

### Docker Issues

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/agente-tritutario/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/agente-tritutario/discussions)
- **Team:** Check [DASHBOARD.md](./docs/DASHBOARD.md) for team contacts

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

---

## 🎯 Development Roadmap

**Week 1 (Feb 9-15):** Foundation & Architecture
- Story 1.1 ✅ (Project Setup)
- Architecture Document finalized
- UX Design System completed

**Week 2 (Feb 16-22):** Core Features
- Story 1.2 (Database Setup)
- Story 1.3 (Authentication)
- Story 1.4 (API Integration)

**Weeks 3-4:** Advanced Features
- AI Chat Agent (Epic 2)
- Tax Analysis Engine (Epic 2)
- Dashboard Implementation (Epic 3)

**Weeks 5-8:** Polish & Launch
- Payment Integration (Epic 5)
- Notifications (Epic 5)
- Testing & QA (Epic 6)
- Go-live (Feb 9 → May 9)

---

**Last Updated:** Feb 9, 2026 | **PM:** Morgan | **Team:** @dev, @architect, @ux-design-expert
