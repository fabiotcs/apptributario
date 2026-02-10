# Tax Analysis API Architecture
## Comprehensive Design for Story 2.3 - Análise Fiscal

**Status**: Architecture Design Phase 1
**Version**: 1.0.0
**Date**: 2026-02-09
**Target Implementation**: Story 2.3 Phase 1 Backend

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [API Endpoints](#api-endpoints)
4. [TaxOpportunityService Architecture](#taxopportunityservice-architecture)
5. [Data Models & Relationships](#data-models--relationships)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling](#error-handling)
8. [Validation Schemas](#validation-schemas)
9. [Service Layer Architecture](#service-layer-architecture)
10. [OpenAPI Specification](#openapi-specification)
11. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

The Tax Analysis API provides Brazilian companies with comprehensive tax regime analysis and optimization capabilities. The system calculates tax liability across three regimes (Simples Nacional, Lucro Presumido, Lucro Real), detects optimization opportunities, and tracks filing deadlines.

### Key Design Principles

- **User-Centric**: EMPRESARIO (company owner) and CONTADOR (accountant) workflows
- **Security First**: JWT authentication + role-based access control
- **Data Validation**: Zod schemas for type-safe inputs
- **Error Handling**: Consistent error responses with meaningful messages
- **Extensibility**: Service-based architecture for easy feature additions
- **Performance**: Pagination support on list endpoints

---

## System Overview

### Actors & Workflows

```
┌─────────────┐
│ EMPRESARIO  │ Creates analyses, views recommendations
│ (Owner)     │ Manages tax filings, sees opportunities
└──────┬──────┘
       │ Creates/Views own analyses
       ▼
┌──────────────────────────────────┐
│  Tax Analysis API (REST)         │
│  • Tax Analyses Endpoints         │
│  • Tax Filings Endpoints          │
│  • Tax Opportunities Endpoints    │
│  • Tax Forecasting Endpoints      │
└──────┬───────────────────────────┘
       │ Reviews/Approves
       ▼
┌─────────────┐
│ CONTADOR    │ Reviews analyses
│ (Accountant)│ Provides recommendations
└─────────────┘

Services Layer:
┌─────────────────────────────────────────────────┐
│ TaxCalculationService (existing)                │
│ • calculateSimples()  → Unified tax             │
│ • calculatePresumido() → Presumed profit       │
│ • calculateReal()     → Actual profit          │
│ • compareRegimes()    → Recommendations        │
└─────────────────────────────────────────────────┘
          ▲
          │ Used by
┌─────────────────────────────────────────────────┐
│ TaxOpportunityService (new)                     │
│ • detectDeductions()                            │
│ • detectCredits()                               │
│ • detectTimingStrategies()                      │
│ • detectExpenseOptimizations()                  │
│ • calculateROI()                                │
└─────────────────────────────────────────────────┘
```

### High-Level Data Flow

```
1. EMPRESARIO creates TaxAnalysis
   POST /api/v1/tax/analyses
   ↓
2. API validates request (Zod schema)
   ↓
3. TaxCalculationService calculates all three regimes
   ↓
4. TaxOpportunityService detects optimization opportunities
   ↓
5. Data stored in TaxAnalysis + TaxOpportunity models
   ↓
6. EMPRESARIO views analysis with regime comparison
   GET /api/v1/tax/analyses/:id
   ↓
7. CONTADOR reviews and approves
   PATCH /api/v1/tax/analyses/:id
   ↓
8. Analysis marked as REVIEWED
```

---

## API Endpoints

### Endpoint Summary

| Method | Path | Purpose | Auth | Roles |
|--------|------|---------|------|-------|
| POST | `/api/v1/tax/analyses` | Create tax analysis | Required | EMPRESARIO, CONTADOR |
| GET | `/api/v1/tax/analyses` | List analyses | Required | Own/Company |
| GET | `/api/v1/tax/analyses/:id` | Get analysis details | Required | Own/Company |
| PATCH | `/api/v1/tax/analyses/:id` | Update analysis | Required | CONTADOR, ADMIN |
| GET | `/api/v1/tax/analyses/:id/comparison` | Regime comparison | Required | Own/Company |
| GET | `/api/v1/tax/analyses/:id/opportunities` | Optimization opportunities | Required | Own/Company |
| GET | `/api/v1/tax/filings` | List tax filings | Required | Own/Company |
| POST | `/api/v1/tax/forecast` | Generate tax forecast | Required | EMPRESARIO, CONTADOR |

---

### Detailed Endpoint Specifications

#### 1. POST `/api/v1/tax/analyses`
**Create a new tax analysis**

```typescript
// Request
{
  companyId: string;           // UUID of company
  year: number;                 // Analysis year (2024, 2025, etc)
  grossRevenue: number;         // Annual revenue in centavos
  expenses?: number;            // Deductible expenses in centavos
  deductions?: number;          // Tax deductions in centavos
  taxCredits?: number;          // Available tax credits in centavos
  previousPayments?: number;    // Already paid estimates in centavos
  sector: string;               // Business sector (COMÉRCIO, INDÚSTRIA, etc)
  analysisType: 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  notes?: string;               // Optional analysis notes
}

// Response (201 Created)
{
  success: true,
  analysis: {
    id: string;
    companyId: string;
    year: number;
    status: 'DRAFT' | 'COMPLETED' | 'REVIEWED' | 'ARCHIVED';
    createdAt: string;           // ISO timestamp
    updatedAt: string;

    // Calculation results (from TaxCalculationService)
    simplasNacional: RegimeCalculation;
    lucroPresumido: RegimeCalculation;
    lucroReal: RegimeCalculation;
    recommendedRegime: 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';
    estimatedSavings: number;    // Annual savings in centavos

    // Additional analysis data
    analysisDetails: string;     // Portuguese explanation
  }
}
```

**Authentication**: Bearer token required
**Authorization**: EMPRESARIO (own company), CONTADOR (assigned company), ADMIN (any)
**Validation**:
- companyId must exist and user must have access
- year must be valid (2000-2050)
- grossRevenue must be > 0
- sector must match predefined list
- expenses, deductions, credits, previousPayments must be >= 0

---

#### 2. GET `/api/v1/tax/analyses`
**List tax analyses with pagination**

```typescript
// Query Parameters
{
  page?: number;               // Default: 1
  limit?: number;              // Default: 20 (max: 100)
  companyId?: string;          // Filter by company
  year?: number;               // Filter by year
  status?: AnalysisStatus;     // Filter by status
  search?: string;             // Search in notes
}

// Response (200 OK)
{
  success: true,
  analyses: TaxAnalysis[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
}
```

**Authentication**: Bearer token required
**Authorization**:
- EMPRESARIO/CONTADOR: Only their own analyses
- ADMIN: All analyses

---

#### 3. GET `/api/v1/tax/analyses/:id`
**Get full analysis details**

```typescript
// Response (200 OK)
{
  success: true,
  analysis: {
    id: string;
    companyId: string;
    year: number;
    status: AnalysisStatus;

    // Original input data
    grossRevenue: number;
    expenses: number;
    deductions: number;
    taxCredits: number;
    previousPayments: number;
    sector: string;
    analysisType: 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
    notes: string;

    // Calculation results
    simplasNacional: RegimeCalculation;
    lucroPresumido: RegimeCalculation;
    lucroReal: RegimeCalculation;
    recommendedRegime: string;
    estimatedSavings: number;
    analysisDetails: string;

    // Metadata
    createdBy: string;          // User ID who created
    reviewedBy?: string;        // User ID who reviewed
    createdAt: string;
    updatedAt: string;
  }
}
```

**Authentication**: Bearer token required
**Authorization**: Owner, assigned CONTADOR, or ADMIN

---

#### 4. PATCH `/api/v1/tax/analyses/:id`
**Update analysis (status, notes, review)**

```typescript
// Request
{
  status?: 'DRAFT' | 'COMPLETED' | 'REVIEWED' | 'ARCHIVED';
  notes?: string;              // Update notes
  expenses?: number;           // Recalculate with new expenses
  deductions?: number;
  taxCredits?: number;
  previousPayments?: number;
  reviewNotes?: string;        // CONTADOR adds review notes
}

// Response (200 OK)
{
  success: true,
  analysis: TaxAnalysis;
}
```

**Authentication**: Bearer token required
**Authorization**:
- CONTADOR (can review/approve)
- ADMIN (full access)
- Creator cannot review own analysis

---

#### 5. GET `/api/v1/tax/analyses/:id/comparison`
**Get regime comparison details**

```typescript
// Response (200 OK)
{
  success: true,
  comparison: {
    analyzeId: string;
    year: number;

    // Detailed regime comparisons
    regimes: [
      {
        name: 'SIMPLES_NACIONAL';
        taxRate: number;         // Percentage (0-1)
        annualTax: number;       // In centavos
        monthlyPayment: number;
        advantages: string[];
        disadvantages: string[];
        suitableFor: string[];   // Business profiles
        profitMargin: string;    // Estimated profit margin
      },
      // LUCRO_PRESUMIDO...
      // LUCRO_REAL...
    ];

    // Recommendation explanation
    recommended: {
      regime: string;
      reason: string;
      estimatedAnnualSavings: number;  // vs current regime
      breakEvenPoint?: number;         // Monthly revenue threshold
      risksAndConsiderations: string[];
    };

    // Visualization data
    chartData: {
      labels: string[];        // ['Simples', 'Presumido', 'Real']
      taxLiabilities: number[]; // Annual tax amounts
      monthlyPayments: number[]; // Monthly payment amounts
    };
  }
}
```

**Authentication**: Bearer token required
**Authorization**: Same as GET /:id

---

#### 6. GET `/api/v1/tax/analyses/:id/opportunities`
**Get optimization opportunities**

```typescript
// Query Parameters
{
  category?: 'DEDUCTION' | 'CREDIT' | 'TIMING' | 'EXPENSE_OPTIMIZATION';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  minROI?: number;             // Minimum ROI filter
}

// Response (200 OK)
{
  success: true,
  opportunities: [
    {
      id: string;
      analysisId: string;
      category: 'DEDUCTION' | 'CREDIT' | 'TIMING' | 'EXPENSE_OPTIMIZATION';
      title: string;
      description: string;
      estimatedSavings: number;      // Annual savings in centavos
      roi: number;                    // ROI percentage (0-100)
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
      applicableRegimes: string[];    // ['SIMPLES', 'PRESUMIDO', 'REAL']

      // Detailed guidance
      requirements: string[];         // What's needed to implement
      taxBreak: string;              // Tax rule/law reference
      estimatedImpact: {
        beforeOptimization: number;
        afterOptimization: number;
        savings: number;
      };

      // Implementation timeline
      timeline: string;              // 'Immediate', '30 days', 'Next quarter', etc
      priority: number;              // 1-10 (higher = more important)
    }
  ];

  summary: {
    totalOpportunities: number;
    potentialAnnualSavings: number;  // Sum of all estimated savings
    highPriorityCount: number;       // Priority >= 7
    implementableNow: number;        // Timeline = 'Immediate'
  };
}
```

**Authentication**: Bearer token required
**Authorization**: Same as GET /:id

---

#### 7. GET `/api/v1/tax/filings`
**List tax filings with deadlines**

```typescript
// Query Parameters
{
  page?: number;
  limit?: number;
  companyId?: string;
  year?: number;
  status?: 'PENDING' | 'FILED' | 'OVERDUE' | 'EXEMPT';
  dueDateFrom?: string;        // ISO date
  dueDateTo?: string;
}

// Response (200 OK)
{
  success: true,
  filings: [
    {
      id: string;
      companyId: string;
      year: number;
      type: 'ECF' | 'ETR' | 'DARF' | 'ANNUAL_RETURN' | 'DECLARATION';
      description: string;       // E.g., "Escrituração Contábil Fiscal"
      dueDate: string;           // ISO date
      status: 'PENDING' | 'FILED' | 'OVERDUE' | 'EXEMPT';

      // For filed documents
      filedDate?: string;
      protocolNumber?: string;
      notes?: string;

      // Calculated fields
      daysUntilDue: number;
      isOverdue: boolean;
      requiredRegimes: string[]; // Which regimes require this filing
    }
  ];

  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  summary: {
    totalPending: number;
    totalOverdue: number;
    nextDueDate: string;
    daysUntilNextDeadline: number;
  };
}
```

**Authentication**: Bearer token required
**Authorization**:
- EMPRESARIO: Own company only
- CONTADOR: Assigned companies
- ADMIN: All

---

#### 8. POST `/api/v1/tax/forecast`
**Generate tax forecast**

```typescript
// Request
{
  companyId: string;
  baseYear: number;            // Reference year for analysis
  forecastMonths: number;      // 1-12 months ahead
  projectedMonthlyRevenue?: number;    // In centavos
  seasonalityFactor?: number;  // 0.8-1.2 for seasonal adjustment
  expectedExpenseGrowth?: number;      // 0.0-0.5 (0-50%)
  regimesToForecast?: string[]; // ['SIMPLES', 'PRESUMIDO', 'REAL']
}

// Response (200 OK)
{
  success: true,
  forecast: {
    id: string;
    companyId: string;
    baseYear: number;
    generatedAt: string;

    // Forecast data by month
    monthlyForecasts: [
      {
        month: number;              // 1-12
        projectedRevenue: number;
        projectedExpenses: number;

        // Tax liability per regime for this month
        regimeTaxForecasts: [
          {
            regime: 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';
            estimatedTax: number;
            estimatedMonthlyPayment: number;
            profitMargin: number;
          }
        ];

        // Recommendation for this month
        recommendedRegime: string;
      }
    ];

    // Annual summary
    annualSummary: {
      totalProjectedRevenue: number;
      totalProjectedExpenses: number;
      projectedProfit: number;

      regimeTotals: [
        {
          regime: string;
          totalAnnualTax: number;
          averageMonthlyPayment: number;
          estimatedAnnualROI: number;
        }
      ];

      // Trending analysis
      recommendedRegimeSequence: string[]; // Month-by-month recommendation
      potentialRegimeSwitches: number;     // Estimated regime changes needed
    };

    // Risk assessment
    risks: [
      {
        type: string;
        description: string;
        mitigation: string;
        probability: 'LOW' | 'MEDIUM' | 'HIGH';
      }
    ];
  }
}
```

**Authentication**: Bearer token required
**Authorization**: EMPRESARIO (own company), CONTADOR (assigned), ADMIN

---

## TaxOpportunityService Architecture

### Service Overview

The `TaxOpportunityService` analyzes a tax analysis to detect optimization opportunities across four categories:

1. **DEDUCTION**: Items that reduce taxable income
2. **CREDIT**: Tax credits that reduce tax liability
3. **TIMING**: Strategic timing of revenue/expenses
4. **EXPENSE_OPTIMIZATION**: Optimize expense structure

### Service Methods

```typescript
export class TaxOpportunityService {

  /**
   * Detect all opportunities for an analysis
   */
  static async detectAllOpportunities(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]>

  /**
   * Detect deduction opportunities
   * Examples: Home office, equipment depreciation, vehicle expenses,
   *          professional education, health insurance, R&D deductions
   */
  static async detectDeductions(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]>

  /**
   * Detect available tax credits
   * Examples: SUDENE (regional development), innovation credit,
   *          export incentives, energy efficiency credits
   */
  static async detectCredits(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]>

  /**
   * Detect timing strategies
   * Examples: Defer revenue to next year, accelerate expenses,
   *          profit distribution timing, quarterly tax planning
   */
  static async detectTimingStrategies(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]>

  /**
   * Detect expense optimization
   * Examples: Outsource vs employ, equipment lease vs purchase,
   *          contract vs employee, service outsourcing
   */
  static async detectExpenseOptimizations(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]>

  /**
   * Calculate ROI for an opportunity
   */
  static calculateROI(
    estimatedSavings: number,
    implementationCost: number
  ): number

  /**
   * Score opportunity by priority
   * Factors: savings, effort, risk, applicability
   */
  static scorePriority(opportunity: TaxOpportunity): number
}
```

### Opportunity Detection Logic

#### DEDUCTION Detection

```typescript
const deductionRules = [
  {
    id: 'home-office',
    title: 'Home Office Deduction',
    description: 'Deduct home office expenses (rent, utilities, internet)',
    requirements: [
      'Work exclusively from home',
      'Document space allocation',
      'Track utility proportions'
    ],
    calculation: (analysis) => {
      // 7% of residential rent or estimated 500-1000 BRL/month
      const homeOfficeDeduction = Math.min(
        analysis.expenses * 0.07,
        12000 // R$120/month * 12
      );
      return homeOfficeDeduction;
    },
    applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
    riskLevel: 'MEDIUM',
    implementationEffort: 'LOW'
  },
  {
    id: 'equipment-depreciation',
    title: 'Equipment Depreciation',
    description: 'Depreciate equipment, machinery, furniture',
    requirements: [
      'Equipment must cost > R$1,000',
      'Document purchase date and cost',
      'Maintain depreciation schedule'
    ],
    calculation: (analysis, company) => {
      // Simplified: assume 10% annual depreciation on equipment
      // Real calculation needs equipment inventory
      return (analysis.expenses * 0.05); // 5% of expenses
    },
    applicableRegimes: ['LUCRO_REAL'],
    riskLevel: 'LOW',
    implementationEffort: 'MEDIUM'
  },
  // ... more deduction rules
];
```

#### CREDIT Detection

```typescript
const creditRules = [
  {
    id: 'sudene-credit',
    title: 'SUDENE Regional Development Credit',
    description: 'Tax credit for companies in Northeast region',
    requirements: [
      'Business located in Northeast region',
      'Qualify for SUDENE benefits',
      'File approval with SUDENE'
    ],
    calculation: (analysis, company) => {
      if (!isNortheastRegion(company)) return 0;
      // Up to 75% of IRPJ liability
      return analysis.taxLiability * 0.75;
    },
    applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
    riskLevel: 'MEDIUM',
    implementationEffort: 'HIGH'
  },
  {
    id: 'innovation-credit',
    title: 'R&D Innovation Tax Credit',
    description: 'Tax credit for R&D spending (Lei do Bem)',
    requirements: [
      'Have documented R&D activities',
      'Spending on innovation projects',
      'Annual reconciliation'
    ],
    calculation: (analysis) => {
      // Simplified: 5% of R&D expenses
      const estimatedRDSpending = analysis.expenses * 0.10;
      return estimatedRDSpending * 0.05;
    },
    applicableRegimes: ['LUCRO_REAL'],
    riskLevel: 'LOW',
    implementationEffort: 'HIGH'
  }
];
```

#### TIMING Detection

```typescript
const timingStrategies = [
  {
    id: 'revenue-deferral',
    title: 'Strategic Revenue Deferral',
    description: 'Defer invoicing to next year for large contracts',
    requirements: [
      'Large contracts (> R$50k)',
      'Flexible billing terms',
      'Cash flow planning'
    ],
    calculation: (analysis) => {
      // Potential: defer up to 10% of annual revenue
      return analysis.grossRevenue * 0.10;
    },
    applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
    riskLevel: 'HIGH',
    implementationEffort: 'MEDIUM'
  },
  {
    id: 'expense-acceleration',
    title: 'Year-End Expense Acceleration',
    description: 'Accelerate deductible expenses before year-end',
    requirements: [
      'Planned expenses > R$10k',
      'Good supplier relationships',
      'Cash available'
    ],
    calculation: (analysis) => {
      // Tax benefit from accelerating expenses
      const taxRate = 0.34; // IRPJ + CSLL
      return (analysis.expenses * 0.15) * taxRate;
    },
    applicableRegimes: ['LUCRO_REAL'],
    riskLevel: 'LOW',
    implementationEffort: 'LOW'
  }
];
```

#### EXPENSE_OPTIMIZATION Detection

```typescript
const expenseOptimizations = [
  {
    id: 'contractor-optimization',
    title: 'Contractor vs Employee Analysis',
    description: 'Compare cost of hiring contractor vs employee',
    requirements: [
      'Regular service need > 6 months',
      'Document vs analysis'
    ],
    calculation: (analysis, company) => {
      const employeeCost = 50000 * 1.36; // Salary + 36% charges
      const contractorCost = 50000 * 1.15; // Contractor + admin costs
      const savings = employeeCost - contractorCost;
      return savings;
    },
    applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
    riskLevel: 'MEDIUM',
    implementationEffort: 'MEDIUM'
  },
  {
    id: 'equipment-lease',
    title: 'Lease vs Purchase Analysis',
    description: 'Compare leasing equipment vs purchasing',
    requirements: [
      'Equipment cost > R$20k',
      'Lease provider available'
    ],
    calculation: (analysis) => {
      // Typical savings: 15-25% of purchase cost
      return analysis.expenses * 0.20;
    },
    applicableRegimes: ['LUCRO_REAL'],
    riskLevel: 'LOW',
    implementationEffort: 'MEDIUM'
  }
];
```

### Opportunity Scoring

```typescript
interface TaxOpportunity {
  id: string;
  analysisId: string;

  // Basic info
  category: 'DEDUCTION' | 'CREDIT' | 'TIMING' | 'EXPENSE_OPTIMIZATION';
  title: string;
  description: string;

  // Financial metrics
  estimatedSavings: number;      // Annual savings in centavos
  implementationCost: number;    // Cost to implement
  roi: number;                    // (savings - cost) / cost * 100

  // Risk & effort
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';

  // Applicability
  applicableRegimes: string[];
  requirements: string[];
  taxBreak: string;              // Tax rule reference

  // Timeline
  timeline: 'Immediate' | '30 days' | 'Next quarter' | 'Next year';

  // Priority scoring
  priority: number;              // 1-10 based on ROI, effort, risk

  // Implementation guidance
  actionItems: string[];
  successMetrics: string[];
}

// Priority calculation
function calculatePriority(opportunity: TaxOpportunity): number {
  let score = 5; // Base score

  // ROI bonus (0-3 points)
  score += Math.min(opportunity.roi / 50, 3);

  // Effort penalty (0-2 points)
  const effortPenalty = {
    'LOW': 0,
    'MEDIUM': -1,
    'HIGH': -2
  };
  score += effortPenalty[opportunity.implementationEffort];

  // Risk penalty (0-2 points)
  const riskPenalty = {
    'LOW': 0,
    'MEDIUM': -0.5,
    'HIGH': -1.5
  };
  score += riskPenalty[opportunity.riskLevel];

  return Math.max(1, Math.min(10, score));
}
```

---

## Data Models & Relationships

### Prisma Schema (Already Implemented)

```prisma
// TaxAnalysis model
model TaxAnalysis {
  id              String   @id @default(cuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id])

  year            Int      // 2024, 2025, etc
  status          AnalysisStatus @default(DRAFT)

  // Input data
  grossRevenue    BigInt   // in centavos
  expenses        BigInt?
  deductions      BigInt?
  taxCredits      BigInt?
  previousPayments BigInt?
  sector          String   // COMÉRCIO, INDÚSTRIA, etc
  analysisType    AnalysisType
  notes           String?

  // Calculation results (stored as JSON)
  simplasNacional   Json
  lucroPresumido    Json
  lucroReal         Json
  recommendedRegime RegimeType
  estimatedSavings  BigInt
  analysisDetails   String

  // Relationships
  taxData         TaxData[]
  taxComparisons  TaxComparison[]
  opportunities   TaxOpportunity[]

  // Metadata
  createdBy       String
  createdAt       DateTime @default(now())
  reviewedBy      String?
  reviewedAt      DateTime?
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@index([year])
  @@index([status])
}

enum AnalysisStatus {
  DRAFT
  COMPLETED
  REVIEWED
  ARCHIVED
}

enum AnalysisType {
  QUARTERLY
  ANNUAL
  CUSTOM
}

// TaxData model (detailed inputs per analysis)
model TaxData {
  id              String @id @default(cuid())
  analysisId      String
  analysis        TaxAnalysis @relation(fields: [analysisId], references: [id])

  key             String      // e.g., 'home_office_rent', 'vehicle_fuel'
  value           BigInt      // Amount in centavos
  description     String?
  month           Int?        // Month of entry (1-12)

  createdAt       DateTime @default(now())

  @@index([analysisId])
  @@index([key])
}

// TaxComparison model (regime comparison details)
model TaxComparison {
  id              String @id @default(cuid())
  analysisId      String
  analysis        TaxAnalysis @relation(fields: [analysisId], references: [id])

  regime          RegimeType
  taxRate         Decimal
  annualTax       BigInt      // in centavos
  monthlyPayment  BigInt
  advantages      String[]
  disadvantages   String[]

  @@index([analysisId])
  @@index([regime])
}

enum RegimeType {
  SIMPLES_NACIONAL
  LUCRO_PRESUMIDO
  LUCRO_REAL
}

// TaxOpportunity model
model TaxOpportunity {
  id                      String @id @default(cuid())
  analysisId              String
  analysis                TaxAnalysis @relation(fields: [analysisId], references: [id])

  category                OpportunityCategory
  title                   String
  description             String

  estimatedSavings        BigInt      // in centavos
  implementationCost      BigInt      // in centavos
  roi                     Decimal     // percentage

  riskLevel               RiskLevel
  implementationEffort    String      // LOW, MEDIUM, HIGH

  applicableRegimes       String[]
  requirements            String[]
  taxBreak                String      // Tax rule reference

  timeline                String      // Immediate, 30 days, etc
  priority                Int         // 1-10

  actionItems             String[]
  successMetrics          String[]

  createdAt               DateTime @default(now())

  @@index([analysisId])
  @@index([category])
  @@index([priority])
}

enum OpportunityCategory {
  DEDUCTION
  CREDIT
  TIMING
  EXPENSE_OPTIMIZATION
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

// TaxFiling model
model TaxFiling {
  id              String @id @default(cuid())
  companyId       String
  company         Company @relation(fields: [companyId], references: [id])

  year            Int
  type            FilingType
  description     String
  dueDate         DateTime
  status          FilingStatus @default(PENDING)

  filedDate       DateTime?
  protocolNumber  String?
  notes           String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@index([dueDate])
  @@index([status])
}

enum FilingType {
  ECF                // Escrituração Contábil Fiscal
  ETR                // Escrituração Tributária
  DARF               // Guia de Recolhimento
  ANNUAL_RETURN      // Declaração Anual
  DECLARATION        // Declaração de IR
}

enum FilingStatus {
  PENDING
  FILED
  OVERDUE
  EXEMPT
}
```

---

## Authentication & Authorization

### JWT Token Structure

```typescript
interface JWTPayload {
  id: string;          // User ID
  email: string;
  role: 'ADMIN' | 'CONTADOR' | 'EMPRESARIO';
  iat: number;         // Issued at
  exp: number;         // Expiration
}
```

### Endpoint Authorization Matrix

| Endpoint | GET | POST | PATCH | Roles | Notes |
|----------|-----|------|-------|-------|-------|
| `/tax/analyses` | ✓ | ✓ | - | EMPRESARIO, CONTADOR | Own/company access |
| `/tax/analyses/:id` | ✓ | - | ✓ | EMPRESARIO, CONTADOR | Own/company access |
| `/tax/analyses/:id/comparison` | ✓ | - | - | EMPRESARIO, CONTADOR | Own/company access |
| `/tax/analyses/:id/opportunities` | ✓ | - | - | EMPRESARIO, CONTADOR | Own/company access |
| `/tax/filings` | ✓ | - | - | All roles | Own/company access |
| `/tax/forecast` | - | ✓ | - | EMPRESARIO, CONTADOR | Own/company access |

### Access Control Rules

```typescript
// Company access check
function canAccessCompany(userId: string, companyId: string, role: string): boolean {
  if (role === 'ADMIN') return true; // Admin can access all

  // Check if user is owner or assigned accountant
  return db.company.findUnique({
    where: { id: companyId },
    select: {
      ownerId: true,
      accountants: { where: { userId } }
    }
  });
}

// Analysis access check
function canAccessAnalysis(userId: string, analysisId: string, role: string): boolean {
  const analysis = db.taxAnalysis.findUnique({
    where: { id: analysisId },
    include: {
      company: {
        select: {
          ownerId: true,
          accountants: { where: { userId } }
        }
      }
    }
  });

  if (role === 'ADMIN') return true;
  if (analysis.createdBy === userId) return true;
  if (analysis.company.ownerId === userId) return true;
  if (analysis.company.accountants.length > 0) return true;

  return false;
}

// Review access check (CONTADOR only)
function canReviewAnalysis(userId: string, analysisId: string, role: string): boolean {
  if (role !== 'CONTADOR' && role !== 'ADMIN') return false;

  const analysis = db.taxAnalysis.findUnique({
    where: { id: analysisId },
    include: { company: { select: { accountants: { where: { userId } } } } }
  });

  return analysis.company.accountants.length > 0 || role === 'ADMIN';
}
```

---

## Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;              // Short error code
  message: string;            // Human-readable message
  statusCode: number;
  timestamp: string;          // ISO timestamp
  details?: {                 // Optional detailed info
    field?: string;           // For validation errors
    value?: unknown;
    constraint?: string;
  };
}
```

### HTTP Status Codes

| Code | Scenario | Response |
|------|----------|----------|
| 400 | Validation error | Missing/invalid field |
| 401 | Authentication | Missing/expired token |
| 403 | Authorization | Insufficient permissions |
| 404 | Resource not found | Analysis/company doesn't exist |
| 409 | Conflict | Analysis already exists for year |
| 500 | Server error | Database error, etc |

### Error Examples

```typescript
// 400 Bad Request - Validation
{
  success: false,
  error: 'ValidationError',
  message: 'Invalid request data',
  statusCode: 400,
  timestamp: '2026-02-09T10:00:00Z',
  details: {
    field: 'grossRevenue',
    value: -1000,
    constraint: 'Must be greater than 0'
  }
}

// 401 Unauthorized
{
  success: false,
  error: 'Unauthorized',
  message: 'Missing or invalid Authorization header',
  statusCode: 401,
  timestamp: '2026-02-09T10:00:00Z'
}

// 403 Forbidden
{
  success: false,
  error: 'Forbidden',
  message: 'You do not have permission to access this analysis',
  statusCode: 403,
  timestamp: '2026-02-09T10:00:00Z'
}

// 404 Not Found
{
  success: false,
  error: 'NotFound',
  message: 'Analysis not found',
  statusCode: 404,
  timestamp: '2026-02-09T10:00:00Z'
}
```

---

## Validation Schemas

### Zod Schemas for Request Validation

```typescript
import { z } from 'zod';

// Shared schemas
const uuidSchema = z.string().uuid('Invalid ID format');
const currencySchema = z.bigint().min(0n, 'Amount must be non-negative');
const yearSchema = z.number().int().min(2000).max(2050);

const sectorEnum = z.enum([
  'COMÉRCIO', 'INDÚSTRIA', 'SERVIÇO', 'TRANSPORTES', 'INTERMEDIAÇÃO'
]);

// POST /tax/analyses
export const createTaxAnalysisSchema = z.object({
  companyId: uuidSchema,
  year: yearSchema,
  grossRevenue: currencySchema.min(1n, 'Revenue must be greater than 0'),
  expenses: currencySchema.optional(),
  deductions: currencySchema.optional(),
  taxCredits: currencySchema.optional(),
  previousPayments: currencySchema.optional(),
  sector: sectorEnum,
  analysisType: z.enum(['QUARTERLY', 'ANNUAL', 'CUSTOM']),
  notes: z.string().max(1000).optional(),
});

// PATCH /tax/analyses/:id
export const updateTaxAnalysisSchema = z.object({
  status: z.enum(['DRAFT', 'COMPLETED', 'REVIEWED', 'ARCHIVED']).optional(),
  notes: z.string().max(1000).optional(),
  expenses: currencySchema.optional(),
  deductions: currencySchema.optional(),
  taxCredits: currencySchema.optional(),
  previousPayments: currencySchema.optional(),
  reviewNotes: z.string().max(2000).optional(),
}).strict();

// GET query schemas
export const listAnalysesSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val) || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val) || 20, 100)),
  companyId: uuidSchema.optional(),
  year: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: z.enum(['DRAFT', 'COMPLETED', 'REVIEWED', 'ARCHIVED']).optional(),
  search: z.string().max(100).optional(),
});

// POST /tax/forecast
export const forecastSchema = z.object({
  companyId: uuidSchema,
  baseYear: yearSchema,
  forecastMonths: z.number().int().min(1).max(12),
  projectedMonthlyRevenue: currencySchema.optional(),
  seasonalityFactor: z.number().min(0.5).max(2.0).optional(),
  expectedExpenseGrowth: z.number().min(0).max(0.5).optional(),
  regimesToForecast: z.array(z.enum(['SIMPLES', 'PRESUMIDO', 'REAL'])).optional(),
});
```

---

## Service Layer Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│  Express Route Handlers (tax.ts)    │ ← HTTP Layer
├─────────────────────────────────────┤
│  Middleware                         │ ← Auth/RBAC
│  • authMiddleware                   │
│  • requireRole()                    │
│  • validateRequest()                │
├─────────────────────────────────────┤
│  Service Layer                      │ ← Business Logic
│  • TaxAnalysisService (new)         │
│  • TaxOpportunityService (new)      │
│  • TaxCalculationService (existing) │
├─────────────────────────────────────┤
│  Data Access Layer (Prisma)         │ ← Database Access
│  • TaxAnalysis CRUD                 │
│  • TaxOpportunity CRUD              │
│  • TaxFiling CRUD                   │
└─────────────────────────────────────┘
```

### TaxAnalysisService

```typescript
export class TaxAnalysisService {
  /**
   * Create a new tax analysis
   */
  static async create(input: CreateTaxAnalysisInput, userId: string): Promise<TaxAnalysis> {
    // 1. Validate company access
    // 2. Validate inputs with Zod schema
    // 3. Calculate taxes using TaxCalculationService
    // 4. Detect opportunities using TaxOpportunityService
    // 5. Store in database
    // 6. Return complete analysis
  }

  /**
   * List analyses with pagination and filters
   */
  static async list(filters: ListFilters, userId: string, role: string): Promise<ListResult> {
    // 1. Build query based on role
    // 2. Apply filters
    // 3. Paginate results
    // 4. Return with metadata
  }

  /**
   * Get full analysis details
   */
  static async getById(analysisId: string, userId: string, role: string): Promise<TaxAnalysis> {
    // 1. Verify access
    // 2. Load from database with all relations
    // 3. Return complete analysis
  }

  /**
   * Update analysis (status, notes, recalculation)
   */
  static async update(
    analysisId: string,
    updates: UpdateInput,
    userId: string,
    role: string
  ): Promise<TaxAnalysis> {
    // 1. Verify access
    // 2. Validate updates
    // 3. Recalculate if expenses changed
    // 4. Update in database
    // 5. Return updated analysis
  }

  /**
   * Get regime comparison details
   */
  static async getComparison(analysisId: string, userId: string): Promise<Comparison> {
    // 1. Load analysis
    // 2. Format regime comparison
    // 3. Add visualization data
    // 4. Return comparison
  }
}
```

### File Structure

```
apps/api/src/
├── routes/
│   ├── api.ts                    (existing - mount tax routes)
│   └── tax.ts                    (new - all tax endpoints)
├── services/
│   ├── TaxCalculationService.ts  (existing)
│   ├── TaxAnalysisService.ts     (new)
│   └── TaxOpportunityService.ts  (new)
├── middleware/
│   ├── auth.ts                   (existing)
│   └── rbac.ts                   (existing)
└── validators/
    └── tax.schemas.ts             (new - Zod schemas)
```

---

## OpenAPI Specification

### Complete OpenAPI 3.0 Spec

See separate file: `docs/openapi/tax-api-spec.yaml` (generated separately)

### Key OpenAPI Components

```yaml
paths:
  /api/v1/tax/analyses:
    post:
      summary: Create tax analysis
      operationId: createTaxAnalysis
      tags: [Tax Analyses]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaxAnalysisRequest'
      responses:
        '201':
          description: Analysis created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaxAnalysisResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

    get:
      summary: List tax analyses
      operationId: listTaxAnalyses
      tags: [Tax Analyses]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 20 }
        - name: companyId
          in: query
          schema: { type: string, format: uuid }
        - name: year
          in: query
          schema: { type: integer }
        - name: status
          in: query
          schema:
            enum: [DRAFT, COMPLETED, REVIEWED, ARCHIVED]
      responses:
        '200':
          description: Analyses list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaxAnalysesListResponse'

  /api/v1/tax/analyses/{id}:
    get:
      summary: Get analysis details
      operationId: getTaxAnalysis
      tags: [Tax Analyses]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200':
          description: Analysis details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaxAnalysisResponse'
        '404':
          $ref: '#/components/responses/NotFound'

    patch:
      summary: Update analysis
      operationId: updateTaxAnalysis
      tags: [Tax Analyses]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateTaxAnalysisRequest'
      responses:
        '200':
          description: Analysis updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaxAnalysisResponse'

  /api/v1/tax/analyses/{id}/comparison:
    get:
      summary: Get regime comparison
      operationId: getTaxComparison
      tags: [Tax Analyses]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200':
          description: Regime comparison
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegimeComparisonResponse'

  /api/v1/tax/analyses/{id}/opportunities:
    get:
      summary: Get optimization opportunities
      operationId: getTaxOpportunities
      tags: [Tax Opportunities]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
        - name: category
          in: query
          schema:
            enum: [DEDUCTION, CREDIT, TIMING, EXPENSE_OPTIMIZATION]
        - name: riskLevel
          in: query
          schema:
            enum: [LOW, MEDIUM, HIGH]
        - name: minROI
          in: query
          schema: { type: number }
      responses:
        '200':
          description: Tax opportunities
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaxOpportunitiesResponse'

  /api/v1/tax/filings:
    get:
      summary: List tax filings
      operationId: listTaxFilings
      tags: [Tax Filings]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 20 }
        - name: status
          in: query
          schema:
            enum: [PENDING, FILED, OVERDUE, EXEMPT]
        - name: dueDateFrom
          in: query
          schema: { type: string, format: date }
        - name: dueDateTo
          in: query
          schema: { type: string, format: date }
      responses:
        '200':
          description: Tax filings list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaxFilingsListResponse'

  /api/v1/tax/forecast:
    post:
      summary: Generate tax forecast
      operationId: createTaxForecast
      tags: [Tax Forecast]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaxForecastRequest'
      responses:
        '200':
          description: Tax forecast
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaxForecastResponse'

components:
  schemas:
    TaxAnalysisResponse:
      type: object
      properties:
        success: { type: boolean }
        analysis:
          type: object
          properties:
            id: { type: string, format: uuid }
            companyId: { type: string, format: uuid }
            year: { type: integer }
            status:
              enum: [DRAFT, COMPLETED, REVIEWED, ARCHIVED]
            grossRevenue: { type: integer }
            expenses: { type: integer }
            sector: { type: string }
            simplasNacional:
              $ref: '#/components/schemas/RegimeCalculation'
            lucroPresumido:
              $ref: '#/components/schemas/RegimeCalculation'
            lucroReal:
              $ref: '#/components/schemas/RegimeCalculation'
            recommendedRegime:
              enum: [SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL]
            estimatedSavings: { type: integer }
            createdAt: { type: string, format: date-time }
            updatedAt: { type: string, format: date-time }

    RegimeCalculation:
      type: object
      properties:
        taxRate: { type: number }
        taxLiability: { type: integer }
        monthlyPayment: { type: integer }
        advantages: { type: array, items: { type: string } }
        disadvantages: { type: array, items: { type: string } }

    TaxOpportunitiesResponse:
      type: object
      properties:
        success: { type: boolean }
        opportunities:
          type: array
          items:
            $ref: '#/components/schemas/TaxOpportunity'
        summary:
          type: object
          properties:
            totalOpportunities: { type: integer }
            potentialAnnualSavings: { type: integer }
            highPriorityCount: { type: integer }
            implementableNow: { type: integer }

    TaxOpportunity:
      type: object
      properties:
        id: { type: string, format: uuid }
        analysisId: { type: string, format: uuid }
        category:
          enum: [DEDUCTION, CREDIT, TIMING, EXPENSE_OPTIMIZATION]
        title: { type: string }
        description: { type: string }
        estimatedSavings: { type: integer }
        roi: { type: number }
        riskLevel:
          enum: [LOW, MEDIUM, HIGH]
        implementationEffort:
          enum: [LOW, MEDIUM, HIGH]
        timeline: { type: string }
        priority: { type: integer, minimum: 1, maximum: 10 }
        requirements: { type: array, items: { type: string } }
        actionItems: { type: array, items: { type: string } }

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  responses:
    BadRequest:
      description: Validation error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    ErrorResponse:
      type: object
      required:
        - success
        - error
        - message
        - statusCode
      properties:
        success: { type: boolean, enum: [false] }
        error: { type: string }
        message: { type: string }
        statusCode: { type: integer }
        timestamp: { type: string, format: date-time }
        details:
          type: object
          properties:
            field: { type: string }
            value: {}
            constraint: { type: string }
```

---

## Implementation Checklist

### Phase 1 Backend Implementation Tasks

#### Tax Routes File (apps/api/src/routes/tax.ts)

- [ ] **POST /api/v1/tax/analyses** - Create analysis
  - [ ] Route handler
  - [ ] Input validation (Zod)
  - [ ] Company access check
  - [ ] Call TaxAnalysisService.create()
  - [ ] Call TaxOpportunityService.detectAllOpportunities()
  - [ ] Return 201 response
  - [ ] Error handling
  - [ ] Unit tests (3 test cases)

- [ ] **GET /api/v1/tax/analyses** - List analyses
  - [ ] Route handler with pagination
  - [ ] Query validation
  - [ ] Role-based filtering
  - [ ] Return list with pagination metadata
  - [ ] Unit tests (3 test cases)

- [ ] **GET /api/v1/tax/analyses/:id** - Get analysis
  - [ ] Route handler
  - [ ] Access control check
  - [ ] Load full analysis with relations
  - [ ] Return complete analysis
  - [ ] 404 error handling
  - [ ] Unit tests (2 test cases)

- [ ] **PATCH /api/v1/tax/analyses/:id** - Update analysis
  - [ ] Route handler
  - [ ] Authorization check (CONTADOR/ADMIN only)
  - [ ] Update with recalculation if needed
  - [ ] Audit trail (record reviewer)
  - [ ] Unit tests (2 test cases)

- [ ] **GET /api/v1/tax/analyses/:id/comparison** - Regime comparison
  - [ ] Route handler
  - [ ] Load analysis
  - [ ] Format comparison data
  - [ ] Add chart data
  - [ ] Return structured comparison
  - [ ] Unit tests (2 test cases)

- [ ] **GET /api/v1/tax/analyses/:id/opportunities** - Get opportunities
  - [ ] Route handler with filters
  - [ ] Category filter
  - [ ] Risk level filter
  - [ ] ROI filter
  - [ ] Return opportunities with summary
  - [ ] Unit tests (3 test cases)

- [ ] **GET /api/v1/tax/filings** - List filings
  - [ ] Route handler with pagination
  - [ ] Status filter
  - [ ] Date range filter
  - [ ] Calculate daysUntilDue, isOverdue
  - [ ] Return filings with summary
  - [ ] Unit tests (2 test cases)

- [ ] **POST /api/v1/tax/forecast** - Generate forecast
  - [ ] Route handler
  - [ ] Input validation
  - [ ] Company access check
  - [ ] Call TaxCalculationService for each month
  - [ ] Generate monthly forecast data
  - [ ] Add annual summary
  - [ ] Return complete forecast
  - [ ] Unit tests (2 test cases)

#### TaxAnalysisService (apps/api/src/services/TaxAnalysisService.ts)

- [ ] `create()` method
  - [ ] Validate inputs
  - [ ] Check company exists
  - [ ] Call TaxCalculationService.compareRegimes()
  - [ ] Create TaxAnalysis record
  - [ ] Return analysis

- [ ] `list()` method
  - [ ] Build Prisma query based on role
  - [ ] Apply filters
  - [ ] Implement pagination
  - [ ] Return paginated results

- [ ] `getById()` method
  - [ ] Check access control
  - [ ] Load from database
  - [ ] Return analysis

- [ ] `update()` method
  - [ ] Check authorization (CONTADOR/ADMIN)
  - [ ] Validate updates
  - [ ] Recalculate if expenses changed
  - [ ] Update database
  - [ ] Return updated analysis

- [ ] `getComparison()` method
  - [ ] Load analysis
  - [ ] Format regime comparison
  - [ ] Add visualization data
  - [ ] Return comparison object

- [ ] Tests (10+ test cases)
  - [ ] Create analysis
  - [ ] List analyses with filters
  - [ ] Get analysis by ID
  - [ ] Update analysis
  - [ ] Get comparison
  - [ ] Access control tests
  - [ ] Error handling

#### TaxOpportunityService (apps/api/src/services/TaxOpportunityService.ts)

- [ ] `detectAllOpportunities()` method
  - [ ] Call all detection methods
  - [ ] Combine results
  - [ ] Score and sort by priority
  - [ ] Return opportunities

- [ ] `detectDeductions()` method
  - [ ] Implement deduction detection rules
  - [ ] Calculate savings per deduction
  - [ ] Return TaxOpportunity objects

- [ ] `detectCredits()` method
  - [ ] Implement credit detection rules
  - [ ] Check eligibility (region, sector)
  - [ ] Calculate credit amounts
  - [ ] Return TaxOpportunity objects

- [ ] `detectTimingStrategies()` method
  - [ ] Implement timing strategies
  - [ ] Calculate potential savings
  - [ ] Assess risk level
  - [ ] Return TaxOpportunity objects

- [ ] `detectExpenseOptimizations()` method
  - [ ] Implement expense optimization rules
  - [ ] Calculate ROI for each option
  - [ ] Return TaxOpportunity objects

- [ ] `calculateROI()` static method
  - [ ] Calculate ROI from savings and cost
  - [ ] Return ROI percentage

- [ ] `scorePriority()` static method
  - [ ] Score based on ROI, effort, risk
  - [ ] Return priority 1-10

- [ ] Tests (15+ test cases)
  - [ ] Deduction detection
  - [ ] Credit detection
  - [ ] Timing strategies
  - [ ] Expense optimizations
  - [ ] ROI calculation
  - [ ] Priority scoring

#### Validation Schemas (apps/api/src/validators/tax.schemas.ts)

- [ ] Create Zod schemas for all endpoints
  - [ ] CreateTaxAnalysisSchema
  - [ ] UpdateTaxAnalysisSchema
  - [ ] ListAnalysesSchema
  - [ ] ForecastSchema
  - [ ] ListFilingsSchema

- [ ] Custom validators
  - [ ] Company access validator
  - [ ] Year validator
  - [ ] Currency amount validator

#### API Route Registration (apps/api/src/routes/api.ts)

- [ ] Import tax routes
- [ ] Mount tax routes at `/tax`
- [ ] Test route registration

#### Integration with TaxCalculationService

- [ ] Verify TaxCalculationService is being used correctly
- [ ] Test calculation accuracy
- [ ] Verify response format matches expectations

#### Database/Prisma Updates

- [ ] Verify migration was applied
- [ ] Verify all models created correctly
- [ ] Create indexes if needed
- [ ] Test relationships

#### Backend Tests (30+ test cases)

- [ ] Unit tests for each service method
- [ ] Integration tests for endpoints
- [ ] Access control tests
- [ ] Validation tests
- [ ] Error handling tests
- [ ] Edge case tests

#### API Documentation

- [ ] Generate OpenAPI spec
- [ ] Create Swagger UI
- [ ] Document all endpoints
- [ ] Document error responses
- [ ] Document examples

---

## Next Steps

1. **Implementation**: @dev will implement all routes and services following this architecture
2. **Testing**: Complete backend test coverage (30+ test cases)
3. **Phase 2**: Frontend implementation with React components
4. **Phase 3**: PDF reporting, integration tests, accessibility audit

---

**Architectural Decision Record**

| Decision | Rationale |
|----------|-----------|
| REST API | Simplicity, CORS-friendly, standard HTTP methods |
| JWT Auth | Stateless, scalable, industry standard |
| Service Layer | Business logic separation, testability |
| Zod Validation | Type-safe, runtime validation, good DX |
| Prisma ORM | Type-safe queries, migrations, excellent DX |
| JSON Response | Standard format, easy to parse, widely supported |
| Pagination | Performance at scale, UX improvement |
| Role-Based Access | Fine-grained control, audit trail support |
