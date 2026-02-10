# 📊 Story 2.3 — Tax Analysis & Optimization

**Epic:** 2 — Core Features
**Story ID:** 2.3
**Priority:** 🔴 CRITICAL — Enables marketplace revenue (advisory fees)
**Assignee:** @dev (Dex)
**Status:** 🔄 In Progress (Phase 1 - Backend Implementation)
**Estimated:** 3-4 days (solo dev) | 2-3 days (2 devs)
**Start Date:** Feb 17, 2026
**Target Completion:** Feb 21, 2026
**Dependencies:** Story 1.1 ✅ (DB), Story 1.2 ✅ (API), Story 2.1 ✅ (Companies), Story 2.2 ✅ (Accountants)

---

## 📝 Story Description

Implement comprehensive **tax analysis system** for **Agente Tributário**, enabling:
- **Analyze company tax situation** (revenue, expenses, deductions, credits)
- **Compare tax regimes** (Simples Nacional vs Lucro Presumido vs Lucro Real)
- **Calculate optimal tax regime** based on company financials
- **Track quarterly tax filings** (ETR, ECF, DARF payments)
- **Identify tax optimization opportunities** (deductions, credits, timing strategies)
- **Historical tax analysis** (trends, year-over-year comparisons)
- **Tax liability forecasting** (project next quarter/year based on current data)
- **Generate tax analysis reports** (PDF with recommendations)
- **Assign accountant reviews** (send analysis to accountant for verification)

This story enables the core value proposition: helping companies optimize their tax situation and understand their tax obligations. It leverages the accountant network from Story 2.2 to provide professional validation of analyses.

**Why this matters:** Tax optimization directly impacts company profitability. The ability to recommend the best tax regime and identify deduction opportunities is the primary value Agente Tributário offers. Without tax analysis, the platform is just a directory. With it, it becomes an advisory platform.

---

## ✅ Acceptance Criteria

### 1. Database Schema Enhancements (Prisma)

#### TaxAnalysis Model
- [ ] `id` (UUID) - Unique analysis identifier
- [ ] `companyId` (UUID, FK) - Company being analyzed
- [ ] `accountantId` (UUID, FK, optional) - Assigned accountant
- [ ] `analysisType` (Enum) - QUARTERLY, ANNUAL, CUSTOM
- [ ] `quarter` (Int, optional) - Q1-Q4 for quarterly analysis
- [ ] `year` (Int) - Tax year analyzed
- [ ] `status` (Enum) - DRAFT, COMPLETED, REVIEWED, ARCHIVED
- [ ] `createdAt` (DateTime)
- [ ] `updatedAt` (DateTime)

#### TaxData Model (Input)
- [ ] `id` (UUID) - Unique financial data entry
- [ ] `analysisId` (UUID, FK) - Parent analysis
- [ ] `grossRevenue` (Int, in cents) - Total revenue
- [ ] `deductions` (JSON) - {category: amount} deductions breakdown
- [ ] `expenses` (JSON) - {category: amount} expenses breakdown
- [ ] `taxCredits` (JSON) - {type: amount} tax credits available
- [ ] `previousPayments` (Int) - Estimated taxes already paid
- [ ] `createdAt` (DateTime)

#### TaxComparison Model (Output)
- [ ] `id` (UUID)
- [ ] `analysisId` (UUID, FK) - Parent analysis
- [ ] `simplasNacional` (JSON) - Calculation for Simples regime
  - { taxRate, taxLiability, monthlyPayment, advantages, disadvantages }
- [ ] `lucroPresumido` (JSON) - Calculation for Lucro Presumido
- [ ] `lucroReal` (JSON) - Calculation for Lucro Real
- [ ] `recommendedRegime` (Enum) - SIMPLES, PRESUMIDO, REAL
- [ ] `estimatedSavings` (Int) - Annual savings vs current regime
- [ ] `analysisDetails` (JSON) - Detailed calculations and reasoning
- [ ] `createdAt` (DateTime)

#### TaxOpportunity Model
- [ ] `id` (UUID)
- [ ] `analysisId` (UUID, FK) - Parent analysis
- [ ] `category` (Enum) - DEDUCTION, CREDIT, TIMING, EXPENSE_OPTIMIZATION
- [ ] `opportunity` (String) - Description (e.g., "R&D tax credit available")
- [ ] `estimatedValue` (Int) - Potential tax savings in cents
- [ ] `riskLevel` (Enum) - LOW, MEDIUM, HIGH
- [ ] `implementation` (String) - How to implement
- [ ] `createdAt` (DateTime)

#### TaxFiling Model
- [ ] `id` (UUID)
- [ ] `companyId` (UUID, FK)
- [ ] `filingType` (Enum) - ECF, ETR, DARF, ANNUAL_RETURN
- [ ] `quarter` (Int, optional)
- [ ] `year` (Int)
- [ ] `dueDate` (DateTime)
- [ ] `status` (Enum) - PENDING, FILED, OVERDUE, EXEMPT
- [ ] `filedDate` (DateTime, optional)
- [ ] `notes` (String, optional)
- [ ] `createdAt` (DateTime)

#### Database Migration
- [ ] Create TaxAnalysis table
- [ ] Create TaxData table
- [ ] Create TaxComparison table
- [ ] Create TaxOpportunity table
- [ ] Create TaxFiling table
- [ ] Add indexes on companyId, analysisType, quarter, year
- [ ] Add FK relationships and cascade rules

### 2. Backend API Routes (`apps/api/src/routes/tax.ts`)

#### Tax Analysis Endpoints
- [ ] `POST /api/v1/tax/analyses` — Create new tax analysis
  - Auth: Requires authenticated user
  - Input: companyId, analysisType, quarter, year, taxData
  - Returns: Analysis object with ID
  - Validation: Company ownership check, valid year/quarter

- [ ] `GET /api/v1/tax/analyses` — List analyses for company
  - Auth: Requires authenticated user
  - Query params: companyId, year, analysisType
  - Returns: Paginated list of analyses
  - RBAC: Company owner, assigned accountant, admin

- [ ] `GET /api/v1/tax/analyses/:id` — Get analysis details
  - Auth: Requires authenticated user
  - Returns: Complete analysis with all sub-models
  - Includes: taxData, comparisons, opportunities, recommendations

- [ ] `PATCH /api/v1/tax/analyses/:id` — Update analysis
  - Auth: Owner or accountant only
  - Input: Partial analysis data
  - Returns: Updated analysis
  - Audit: Log changes

- [ ] `DELETE /api/v1/tax/analyses/:id` — Archive analysis
  - Auth: Owner or accountant
  - Soft delete via archived flag

#### Tax Comparison Endpoints
- [ ] `GET /api/v1/tax/analyses/:id/comparison` — Get tax regime comparison
  - Returns: Side-by-side comparison of all three regimes
  - Includes: Calculations, tax liability, monthly payments, recommendation

- [ ] `GET /api/v1/tax/analyses/:id/opportunities` — Get identified opportunities
  - Returns: List of tax optimization opportunities
  - Includes: Category, estimated value, risk level, implementation

#### Tax Filing Endpoints
- [ ] `GET /api/v1/tax/filings` — List company tax filings
  - Query params: companyId, year, status
  - Returns: Upcoming and past filings with status

- [ ] `POST /api/v1/tax/filings/:id/mark-filed` — Mark filing as completed
  - Auth: Accountant or company owner
  - Input: filedDate, notes
  - Returns: Updated filing

#### Tax Forecast Endpoint
- [ ] `POST /api/v1/tax/forecast` — Project next quarter/year tax liability
  - Input: companyId, currentRevenue, growthRate
  - Returns: Projected tax liability and recommendations

### 3. Backend Tax Calculation Engine (`apps/api/src/services/TaxCalculationService.ts`)

#### Simples Nacional Calculation
- [ ] Determine if company eligible (revenue < R$4.8M)
- [ ] Apply correct tax rate based on sector
- [ ] Calculate monthly payments
- [ ] Identify advantages/disadvantages

#### Lucro Presumido Calculation
- [ ] Apply presumed profit percentage by sector
- [ ] Calculate federal tax (IRPJ + CSLL)
- [ ] Calculate state tax (ICMS if applicable)
- [ ] Calculate monthly payments

#### Lucro Real Calculation
- [ ] Calculate actual taxable profit from provided data
- [ ] Apply federal tax rates (IRPJ + CSLL)
- [ ] Calculate estimated payments (quarterly)
- [ ] Calculate final annual payment

#### Comparative Analysis
- [ ] Compare all three regimes
- [ ] Identify optimal regime
- [ ] Calculate annual savings
- [ ] Provide detailed reasoning

### 4. Tax Opportunity Detection (`apps/api/src/services/TaxOpportunityService.ts`)

#### Deduction Opportunities
- [ ] Identify standard deductions by sector
- [ ] Identify accelerated depreciation opportunities
- [ ] Identify research & development credits
- [ ] Identify charitable donation deductions

#### Timing Optimization
- [ ] Suggest expense timing strategies
- [ ] Identify revenue recognition timing optimization
- [ ] Calculate quarterly payment optimization

#### Risk Assessment
- [ ] Assess implementation risk for each opportunity
- [ ] Flag aggressive tax positions
- [ ] Recommend professional review for high-risk items

### 5. Frontend Pages

#### Tax Analysis List Page (`/dashboard/companies/:id/tax/analyses`)
- [ ] Display list of analyses for company
- [ ] Filter by year, type, status
- [ ] Create new analysis button
- [ ] View/edit/delete actions
- [ ] Show latest analysis first
- [ ] Display analysis summary (recommended regime, potential savings)

#### Create Analysis Page (`/dashboard/companies/:id/tax/analyses/create`)
- [ ] Multi-step form:
  1. Select analysis type (Quarterly/Annual/Custom)
  2. Enter financial data (revenue, expenses, deductions, credits)
  3. Review calculated recommendations
  4. Create analysis
- [ ] Form validation with Zod
- [ ] Auto-calculate comparisons as data entered
- [ ] Save draft feature

#### Analysis Detail Page (`/dashboard/tax/analyses/:id`)
- [ ] Show complete tax analysis
- [ ] Tax regime comparison (3-column layout)
  - Simples Nacional | Lucro Presumido | Lucro Real
  - Tax liability, monthly payment, advantages, disadvantages
- [ ] Show recommended regime (highlighted)
- [ ] Identified opportunities section
  - List with category, estimated value, risk level
- [ ] Historical comparison (trend chart)
- [ ] Assign accountant for review button
- [ ] Generate PDF report button
- [ ] Audit trail

#### Tax Filings Page (`/dashboard/companies/:id/tax/filings`)
- [ ] Display upcoming and past tax filings
- [ ] Color-coded status (pending, filed, overdue)
- [ ] Mark as filed action
- [ ] Add notes to filing
- [ ] Calendar view (optional)

### 6. Frontend Components

#### Components to Build
- [ ] `TaxComparisonTable.tsx` - Side-by-side regime comparison
- [ ] `TaxOpportunitiesList.tsx` - Tax savings opportunities
- [ ] `TaxCharts.tsx` - Historical analysis visualizations
- [ ] `TaxRegimeCard.tsx` - Individual regime details card
- [ ] `FilingStatusBadge.tsx` - Filing status indicator
- [ ] `TaxAnalysisForm.tsx` - Multi-step analysis creation form
- [ ] `TaxForecastChart.tsx` - Projected tax liability chart

### 7. Frontend Validation & Types

- [ ] Zod schemas for tax analysis creation/update
- [ ] Type definitions for TaxAnalysis, TaxComparison, TaxOpportunity
- [ ] Validation for financial data inputs (no negative values, reasonable ranges)
- [ ] Currency input helpers (formatting/parsing cents)

### 8. API Integration

- [ ] `useTaxAnalyses()` hook - CRUD operations on analyses
- [ ] `useTaxComparison()` hook - Get regime comparison
- [ ] `useTaxOpportunities()` hook - Get opportunities
- [ ] `useTaxFilings()` hook - Get/manage filings
- [ ] `useTaxForecast()` hook - Generate forecast

### 9. PDF Report Generation

- [ ] Generate tax analysis report as PDF
  - Company info header
  - Executive summary (recommended regime, potential savings)
  - Tax regime comparison table
  - Opportunities section
  - Historical analysis
  - Accountant review section
- [ ] Download/email PDF option

### 10. Testing

#### Backend Tests
- [ ] Simples Nacional calculations (various scenarios)
- [ ] Lucro Presumido calculations
- [ ] Lucro Real calculations
- [ ] Comparison logic (correct regime recommendation)
- [ ] Opportunity detection (deductions, credits, timing)
- [ ] Tax filing status tracking
- [ ] RBAC (company owner, accountant, admin)
- [ ] Audit logging for analyses

#### Frontend Tests
- [ ] Form validation (financial inputs)
- [ ] Analysis list display and filtering
- [ ] Tax regime comparison display
- [ ] Opportunity list display
- [ ] PDF generation (if using library)
- [ ] Integration tests for full workflow

### 11. Documentation

- [ ] Tax calculation formulas documented (Simples, Presumido, Real)
- [ ] Tax opportunity categories documented
- [ ] API endpoints documented (OpenAPI)
- [ ] Frontend component documentation
- [ ] User guide for tax analysis feature

### 12. Performance & Optimization

- [ ] Database indexes on companyId, year, quarter
- [ ] Lazy load detailed analysis data
- [ ] Cache tax calculations (same input = same result)
- [ ] Pagination for analysis lists
- [ ] Optimize PDF generation (background job or streaming)

---

## 🎯 Implementation Plan (3 Phases)

### Phase 1: Backend Tax Calculation & Storage (Day 1-2)
**Status:** ✅ COMPLETE
**Deliverable:** Database schema, TaxCalculationService, TaxOpportunityService, API endpoints

#### Tasks:
- [ ] Create TaxAnalysis, TaxData, TaxComparison, TaxOpportunity, TaxFiling models
- [ ] Generate migration and apply
- [ ] Implement TaxCalculationService with 3 regime calculations
- [ ] Implement TaxOpportunityService with deduction/credit detection
- [ ] Create tax API routes (analyses, filings, forecast)
- [ ] Add RBAC checks (company owner, accountant, admin)
- [ ] Write backend tests (30+ tests)

**Verification:**
- [ ] All tax calculations work correctly
- [ ] Regime comparison logic correct (recommends best option)
- [ ] Opportunities detected accurately
- [ ] RBAC properly enforced
- [ ] Tests pass (>80% coverage)

---

### Phase 2: Frontend Tax Analysis UI (Day 2-3)
**Status:** 🔄 Pending
**Deliverable:** Analysis pages, forms, comparison display

#### Tasks:
- [ ] Create analysis list page with filters
- [ ] Create multi-step analysis creation form
- [ ] Create analysis detail page with regime comparison
- [ ] Create tax filings page
- [ ] Build reusable components (comparison table, opportunities, charts)
- [ ] Create validation schemas (Zod)
- [ ] Build API hooks (useTaxAnalyses, useTaxComparison, etc.)
- [ ] Add form validation

**Verification:**
- [ ] All pages display correctly
- [ ] Form validation works
- [ ] Comparison displays side-by-side clearly
- [ ] Real-time calculation as user inputs data

---

### Phase 3: Reporting & Polish (Day 3-4)
**Status:** 🔄 Pending
**Deliverable:** PDF reports, tests, documentation

#### Tasks:
- [ ] Implement PDF report generation
- [ ] Write frontend tests (20+ tests)
- [ ] Write integration tests
- [ ] Update API documentation (OpenAPI)
- [ ] Add accessibility checks (WCAG AA)
- [ ] Performance optimization
- [ ] Error handling and edge cases

**Verification:**
- [ ] PDF reports generate correctly
- [ ] All tests pass (>80% coverage)
- [ ] No TypeScript errors
- [ ] WCAG AA compliant
- [ ] Documentation complete

---

## 🔑 Key Implementation Details

### Tax Regime Definitions

#### Simples Nacional
- Eligible if: Gross revenue < R$4.8M (2024)
- Advantage: Single unified tax, simplified accounting
- Disadvantage: Cannot recover VAT credit, higher rates
- Tax rate: 4-33.5% depending on sector
- Filing: Monthly via DAS (single payment)

#### Lucro Presumido
- Eligible: Any company can elect
- Advantage: Moderate tax rate, simple calculation
- Disadvantage: Fixed profit margin, cannot use actual profit
- Presumed profit margin: 8-32% depending on sector
- Filing: Quarterly estimated payments + annual reconciliation

#### Lucro Real
- Eligible: Any company, required for over R$78M (2024)
- Advantage: Lower rate if profit is low, can recover VAT credits
- Disadvantage: Requires detailed accounting, more complex
- Tax rate: 34% federal (IRPJ 15% + CSLL 9% + additional CSLL 20% on profit)
- Filing: Quarterly estimated + annual filing

### Database Relationships

```
Company
  ├── TaxAnalysis (1:N)
  │   ├── TaxData (1:1) - Input data
  │   ├── TaxComparison (1:1) - Calculations
  │   └── TaxOpportunity (1:N) - Opportunities
  └── TaxFiling (1:N) - Filing deadlines/status

Accountant
  └── TaxAnalysis (assigned) (1:N) - Reviews
```

### Calculation Example

**Input:** Company with R$2.5M gross revenue, R$1.5M expenses, R$100K deductions

**Simples Nacional:**
- Rate: 8.8% (example for services)
- Tax: R$2,500,000 × 8.8% = R$220,000
- Monthly: R$18,333

**Lucro Presumido:**
- Presumed profit: R$2,500,000 × 32% = R$800,000
- Tax: R$800,000 × 34% = R$272,000
- Quarterly: R$68,000

**Lucro Real:**
- Actual profit: R$2,500,000 - R$1,500,000 - R$100,000 = R$900,000
- Tax: R$900,000 × 34% = R$306,000
- Quarterly: R$76,500

**Recommendation:** Simples Nacional (saves R$52,000-86,000 annually)

---

## 📋 Dev Agent Record

### Checkboxes (Mark as [x] when complete)

**Phase 1 — Backend Tax Calculation & Storage:**
- [x] Database models created with all fields
- [x] Migration created and applied
- [x] TaxCalculationService implemented (3 regimes)
- [x] TaxOpportunityService implemented
- [x] Tax API routes created (all endpoints)
- [x] RBAC authorization checks added
- [x] Backend tests created and passing

**Phase 2 — Frontend Tax Analysis UI:**
- [ ] Analysis list page created
- [ ] Analysis creation form created
- [ ] Analysis detail page created
- [ ] Tax filings page created
- [ ] Reusable components created
- [ ] Form validation working
- [ ] API integration working

**Phase 3 — Reporting & Polish:**
- [ ] PDF report generation implemented
- [ ] Frontend tests created and passing
- [ ] Integration tests created and passing
- [ ] Documentation complete
- [ ] TypeScript types clean
- [ ] WCAG AA accessibility checked
- [ ] All tests passing (>80% coverage)
- [ ] Ready for review

### Debug Log

*(To be populated during implementation)*

---

## ✨ Completion Notes

- [x] Phase 1 backend 100% complete
- [x] 31 unit tests passing for TaxCalculationService and TaxOpportunityService
- [x] 8 REST endpoints implemented with full RBAC
- [x] Tax regime calculations verified against examples
- [x] Opportunity detection algorithm tested for all 4 categories
- [x] Database models integrated with Prisma
- [x] Zod validation schemas for all inputs
- [x] Architecture documentation complete (3 detailed docs)

---

## 📁 File List

**Files to be Created/Modified:**

| File | Status | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | ✅ Done | TaxAnalysis, TaxData, TaxComparison, TaxOpportunity, TaxFiling models created |
| `prisma/migrations/20260210205955_add_tax_analysis/migration.sql` | ✅ Done | Database migration applied successfully |
| `apps/api/src/services/TaxCalculationService.ts` | ✅ Done | Tax regime calculations (800+ lines, all 3 regimes) |
| `apps/api/src/services/TaxOpportunityService.ts` | ✅ Done | Tax opportunity detection (deductions, credits, timing, optimizations) |
| `apps/api/src/routes/tax.ts` | ✅ Done | Tax API endpoints (8 routes, full RBAC) |
| `apps/api/src/validators/tax.schemas.ts` | ✅ Done | Zod validation schemas for all inputs |
| `apps/api/src/routes/api.ts` | ✅ Done | Updated to mount tax routes |
| `apps/api/__tests__/tax.test.ts` | ✅ Done | Backend tests (31 passing tests) |
| `docs/architecture/tax-api-architecture.md` | ✅ Done | Complete API architecture documentation |
| `docs/openapi/tax-api-spec.yaml` | ✅ Done | OpenAPI 3.0 specification |
| `docs/architecture/TAX-API-IMPLEMENTATION-GUIDE.md` | ✅ Done | Implementation guide for developers |
| `apps/web/src/app/dashboard/companies/[id]/tax/analyses/page.tsx` | 📝 New | Analysis list page |
| `apps/web/src/app/dashboard/companies/[id]/tax/analyses/create/page.tsx` | 📝 New | Create analysis page |
| `apps/web/src/app/dashboard/tax/analyses/[id]/page.tsx` | 📝 New | Analysis detail page |
| `apps/web/src/app/dashboard/companies/[id]/tax/filings/page.tsx` | 📝 New | Tax filings page |
| `apps/web/src/components/tax/TaxComparisonTable.tsx` | 📝 New | Regime comparison display |
| `apps/web/src/components/tax/TaxOpportunitiesList.tsx` | 📝 New | Opportunities list |
| `apps/web/src/components/tax/TaxCharts.tsx` | 📝 New | Historical analysis charts |
| `apps/web/src/components/tax/TaxRegimeCard.tsx` | 📝 New | Individual regime card |
| `apps/web/src/components/tax/FilingStatusBadge.tsx` | 📝 New | Filing status indicator |
| `apps/web/src/components/tax/TaxAnalysisForm.tsx` | 📝 New | Multi-step analysis form |
| `apps/web/src/lib/validation/tax.ts` | 📝 New | Zod schemas |
| `apps/web/src/hooks/useTaxAnalyses.ts` | 📝 New | API hooks |
| `apps/web/__tests__/tax.test.ts` | 📝 New | Frontend tests |
| `docs/api/tax-openapi.yaml` | 📝 New | OpenAPI documentation |
| `docs/architecture/tax-calculation.md` | 📝 New | Tax calculation formulas |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-09 | Story created | @dev (Dex) |

---

## 🎯 Dev Notes

- Tax calculations must be accurate to the cent (integer cents, not floats)
- Test with real-world scenarios (different company sizes, sectors, scenarios)
- IRPJ base: 15% + 10% for profit over R$20K/month
- CSLL: 9% base + 20% additional on profit over R$20K/month
- Simples rates vary by sector code (CNAE) - need lookup table
- Lucro Presumido presumed margin also by sector (need lookup table)
- Consider multi-state companies (different ICMS rates by state)
- Future: Integration with e-CAC (electronic tax filing system)

---

## 🚀 Success Criteria

Story 2.3 is complete when:
1. ✅ All 3 tax regimes calculate correctly (verified against official examples)
2. ✅ Regime comparison recommends correct optimal regime
3. ✅ Tax opportunities detected with accurate estimated values
4. ✅ All pages display correctly and are responsive
5. ✅ Form validation prevents invalid data entry
6. ✅ PDF reports generate and display correctly
7. ✅ All tests passing (>80% coverage)
8. ✅ WCAG AA accessibility compliant
9. ✅ No TypeScript errors
10. ✅ Documentation complete and accurate
