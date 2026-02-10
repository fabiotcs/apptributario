# Database Documentation

**Agente Tributário** — PostgreSQL + Prisma ORM

---

## Quick Start

### Start PostgreSQL & Redis

```bash
docker-compose up -d
```

### Run migrations

```bash
cd apps/api
npm run db:migrate
```

### Seed sample data

```bash
npm run db:seed
```

### View data in browser

```bash
npm run db:studio
```

Open: http://localhost:5555

---

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:migrate:dev` | Create + apply new migration |
| `npm run db:push` | Push schema changes (dev only) |
| `npm run db:seed` | Populate with seed data |
| `npm run db:reset` | Reset DB to clean state (dev) |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Schema Overview

### 13 Tables (4 Categories)

#### Users & Authentication (1 table)
- **User** — System users (admin, contador, empresario)

#### Companies & Organization (4 tables)
- **Company** — Business entities with tax regime
- **CompanyUser** — User-to-company relationships (multi-tenant)
- **CompanyBranch** — Multi-branch support by state
- **RegimeHistory** — Track regime changes over time

#### Tax & Classification (2 tables)
- **ReceiptClassification** — Fiscal classification (serviço/produto)
- Regime configurations (in tables)

#### AI & Engagement (3 tables)
- **ChatHistory** — AI conversations
- **ChatFeedback** — User ratings on AI responses
- **CounterAlert** — Alerts for contadores

#### Notifications (1 table)
- **Notification** — In-app alerts

#### Monetization (2 tables)
- **Subscription** — Stripe/payment integration
- **Referral** — Contador commission tracking

#### Compliance (1 table)
- **AuditLog** — LGPD audit trail (2-year retention)

---

## Key Design Decisions

### Soft Deletes

All tables include `deletedAt` timestamp for LGPD compliance:

```typescript
deletedAt DateTime?
```

Query non-deleted records:

```typescript
where: {
  deletedAt: null
}
```

### Audit Logging

Every major action logged:

```typescript
AuditLog {
  id, userId, companyId, action, resource, resourceId, changes, ipAddress, userAgent, createdAt
}
```

Actions: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, PERMISSION_GRANT, etc.

### Multi-Tenancy

Users can access multiple companies via `CompanyUser`:

```typescript
// Get all companies for a user
user.companyUsers.map(cu => cu.company)
```

### Time Tracking

Every table has:

```typescript
createdAt  DateTime @default(now())
updatedAt  DateTime @updatedAt
```

Automatic updates on modification.

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        USER                             │
├─────────────────────────────────────────────────────────┤
│ id (PK) | email (UQ) | passwordHash | name              │
│ role | createdAt | updatedAt | deletedAt               │
└─────────────────────────────────────────────────────────┘
            │                    │                  │
            ├─────────────────┐  │                  │
            ↓                 ↓  ↓                  ↓
    ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐
    │  COMPANY     │  │ COMPANY_USER    │  │ NOTIFICATION │
    │ (FK: userId) │  │ (FK: userId,    │  │ (FK: userId) │
    │              │  │      companyId) │  │              │
    └──────────────┘  └─────────────────┘  └──────────────┘
            │                 │
            ├─────────┬───────┘
            ↓         ↓
    ┌──────────────────────────────────────────┐
    │         COMPANY_BRANCH                    │
    │         REGIME_HISTORY                    │
    │         RECEIPT_CLASSIFICATION            │
    │         CHAT_HISTORY                      │
    │         COUNTER_ALERT                     │
    │         SUBSCRIPTION                      │
    │         REFERRAL                          │
    │         AUDIT_LOG                         │
    └──────────────────────────────────────────┘
```

---

## Common Queries

### Find user with companies

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    companyUsers: {
      include: {
        company: true
      }
    }
  }
});

// Access companies
user.companyUsers.forEach(cu => {
  console.log(cu.company.name);
});
```

### Get company with full details

```typescript
const company = await prisma.company.findUnique({
  where: { id: companyId },
  include: {
    owner: true,
    branches: true,
    regimeHistory: true,
    companyUsers: {
      include: {
        user: true
      }
    },
    chatHistory: true,
    counterAlerts: true
  }
});
```

### Find alerts for contador's clients

```typescript
const alerts = await prisma.counterAlert.findMany({
  where: {
    company: {
      companyUsers: {
        some: {
          userId: contadorId,
          role: 'ACCOUNTANT'
        }
      }
    },
    isResolved: false
  },
  include: {
    company: true
  }
});
```

### Get user chat history

```typescript
const chats = await prisma.chatHistory.findMany({
  where: {
    userId: userId,
    company: {
      companyUsers: {
        some: {
          userId: userId
        }
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  },
  include: {
    feedback: true
  }
});
```

### Track regime changes

```typescript
const history = await prisma.regimeHistory.findMany({
  where: {
    companyId: companyId
  },
  orderBy: {
    effectiveDate: 'desc'
  }
});
```

---

## Data Types

### Money (Centavos)

All currency stored as `BigInt` in centavos:

```typescript
// R$ 425.500,00 stored as 42550000 (425500 * 100)
revenue: BigInt

// Convert to display
displayValue = revenue / 100n; // BigInt division
```

### JSON Fields

Flexible data storage:

```typescript
// Notification metadata
metadata: Json?

// Example:
{
  "companyId": "xyz",
  "amount": 12500,
  "threshold": 180000
}
```

---

## Indexes

Performance optimization:

```typescript
@@index([email])        // User lookups
@@index([ownerId])      // Owner queries
@@index([cnpj])         // CNPJ searches
@@index([role])         // Role filtering
@@index([userId])       // User relationships
@@index([companyId])    // Company relationships
@@index([taxRegime])    // Regime queries
@@index([isRead])       // Notification filtering
@@index([severity])     // Alert filtering
@@index([createdAt])    // Time-based queries
```

---

## Migration Strategy

### Creating migrations

```bash
# Auto-generate from schema changes
npm run db:migrate:dev --name add_new_field

# Review generated migration.sql
# Make sure it's correct

# Commit to git
git add apps/api/prisma/migrations
git commit -m "migration: add_new_field"
```

### Rolling back

```bash
# Resolve failed migration (dev only)
npx prisma migrate resolve --rolled-back migration_name
```

### Deployment migrations

```bash
# Production: apply migrations
npm run db:migrate
```

---

## Seed Data

### Location

`apps/api/prisma/seed.ts`

### Running

```bash
npm run db:seed
```

### Includes

- 3 users (admin, contador, empresario)
- 2 companies with 2 branches
- Relationships and sample data
- Audit logs
- Complete data for testing

---

## API Integration

### Using Prisma in API

```typescript
// apps/api/src/lib/db.ts
import prisma from '../lib/db';

// Use in routes
router.get('/companies/:id', async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { id: req.params.id },
    include: { owner: true }
  });
  res.json(company);
});
```

### Health Check

```typescript
GET /health/db

Response:
{
  "status": "ok",
  "database": {
    "status": "connected",
    "responseTime": 2
  }
}
```

---

## Performance Tips

### 1. Use includes wisely

```typescript
// ❌ Bad: N+1 queries
const companies = await prisma.company.findMany();
for (const company of companies) {
  company.owner; // Separate query per company!
}

// ✅ Good: Single query with join
const companies = await prisma.company.findMany({
  include: { owner: true }
});
```

### 2. Pagination

```typescript
// Don't load all records
const companies = await prisma.company.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});
```

### 3. Select only needed fields

```typescript
// Only get required fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
    // Omit passwordHash, createdAt, etc.
  }
});
```

---

## Testing Database

### Run tests

```bash
npm test -- db.test.ts
```

### Test coverage

- Connection tests
- Schema validation
- CRUD operations
- Relationships
- Enums
- Aggregations
- Error handling

---

## Troubleshooting

### "Database unavailable" error

```bash
# Ensure PostgreSQL is running
docker-compose ps

# Start if needed
docker-compose up -d postgres
```

### "PrismaClient is not initialized"

```bash
# Regenerate Prisma client
npx prisma generate
```

### Connection timeout

```bash
# Check DATABASE_URL in .env
# Should be: postgresql://user:password@localhost:5432/dbname

# Test connection
npx prisma db execute --stdin < /dev/null
```

### Migration conflicts

```bash
# Reset DB (dev only!)
npm run db:reset

# Or manually resolve
npx prisma migrate resolve --rolled-back migration_name
```

---

## Security

### Sensitive Data

- Passwords stored as hashes (bcrypt) in `passwordHash`
- Never log passwords, tokens, API keys
- Use encryption for sensitive fields if needed

### SQL Injection Prevention

Prisma prevents SQL injection via parameterized queries:

```typescript
// ✅ Safe: parameterized
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// ❌ Never do raw queries with user input
const user = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = '${userInput}'
`; // UNSAFE!
```

### LGPD Compliance

- Soft deletes preserve audit trail
- AuditLog tracks all changes
- User data export via select queries
- Data retention: 2 years for audit logs

---

**Last Updated:** February 10, 2026
**Status:** Production Ready
