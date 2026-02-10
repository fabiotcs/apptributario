# Tax Analysis API - Implementation Guide

**Status**: Ready for Development
**Story**: Story 2.3 Phase 1 Backend
**Architect**: Aria
**Target Developer**: @dev

---

## Quick Start for Implementation

### What You Have

✅ **Database Schema** - 5 new Prisma models with proper relationships
✅ **TaxCalculationService** - Fully implemented tax calculation engine
✅ **Architecture Document** - Complete system design with all patterns
✅ **OpenAPI Specification** - Full API contract documented
✅ **Validation Schemas** - Ready for Zod integration

### What You Need to Build

1. **Tax Routes File** (`apps/api/src/routes/tax.ts`) - 8 endpoints
2. **TaxAnalysisService** (`apps/api/src/services/TaxAnalysisService.ts`) - Business logic
3. **TaxOpportunityService** (`apps/api/src/services/TaxOpportunityService.ts`) - Opportunity detection
4. **Validation Schemas** (`apps/api/src/validators/tax.schemas.ts`) - Zod validation
5. **Backend Tests** - 30+ test cases covering all functionality

---

## Implementation Order

### Phase 1: Setup & Scaffolding (1 hour)

1. Create `apps/api/src/routes/tax.ts` file with route skeleton
2. Create `apps/api/src/services/TaxAnalysisService.ts` with class structure
3. Create `apps/api/src/services/TaxOpportunityService.ts` with class structure
4. Create `apps/api/src/validators/tax.schemas.ts` with all Zod schemas
5. Update `apps/api/src/routes/api.ts` to import and mount tax routes

### Phase 2: Validation Layer (1.5 hours)

1. Implement all Zod schemas in `tax.schemas.ts`
2. Create validation middleware for request body
3. Create query parameter validators
4. Test validation with invalid inputs

### Phase 3: Service Layer - TaxAnalysisService (3 hours)

Implement methods in order:

1. `create()` - Create analysis with full calculation
   - Validate company access
   - Call TaxCalculationService.compareRegimes()
   - Store in database
   - Call TaxOpportunityService.detectAllOpportunities()

2. `list()` - Paginated listing with filters
   - Build role-based Prisma query
   - Apply filters
   - Return with pagination metadata

3. `getById()` - Retrieve single analysis
   - Verify access control
   - Load full analysis with relations

4. `update()` - Update analysis
   - Check authorization
   - Support status, notes, recalculation
   - Mark reviewer if status changes

5. `getComparison()` - Format regime comparison
   - Load analysis
   - Format comparison data
   - Add chart data for visualization

### Phase 4: Service Layer - TaxOpportunityService (3 hours)

Implement detection methods:

1. `detectDeductions()` - Home office, equipment, vehicle
2. `detectCredits()` - Regional, innovation, export credits
3. `detectTimingStrategies()` - Revenue deferral, expense acceleration
4. `detectExpenseOptimizations()` - Contractor, lease analysis

Each method should:
- Define opportunity rules/algorithms
- Calculate savings with real tax rates
- Return TaxOpportunity objects with priority scores

### Phase 5: Route Handlers (4 hours)

Implement endpoints in order:

1. **POST `/api/v1/tax/analyses`**
   - Validate input
   - Call TaxAnalysisService.create()
   - Return 201 response
   - Handle errors

2. **GET `/api/v1/tax/analyses`**
   - Parse pagination params
   - Call TaxAnalysisService.list()
   - Return with metadata

3. **GET `/api/v1/tax/analyses/:id`**
   - Validate UUID
   - Call TaxAnalysisService.getById()
   - Return analysis

4. **PATCH `/api/v1/tax/analyses/:id`**
   - Validate update input
   - Check CONTADOR/ADMIN authorization
   - Call TaxAnalysisService.update()
   - Return updated analysis

5. **GET `/api/v1/tax/analyses/:id/comparison`**
   - Call TaxAnalysisService.getComparison()
   - Return formatted comparison

6. **GET `/api/v1/tax/analyses/:id/opportunities`**
   - Load analysis opportunities
   - Apply filters (category, risk, ROI)
   - Return with summary

7. **GET `/api/v1/tax/filings`**
   - List filings with pagination
   - Apply status/date filters
   - Calculate days until due
   - Return with summary

8. **POST `/api/v1/tax/forecast`**
   - Validate input
   - Call TaxCalculationService for each month
   - Generate monthly forecasts
   - Return complete forecast

### Phase 6: Testing (4 hours)

- [ ] 30+ unit tests for services
- [ ] 8+ integration tests for endpoints
- [ ] Access control tests
- [ ] Validation tests
- [ ] Error handling tests

### Phase 7: Integration & Documentation (1 hour)

- [ ] Verify route registration
- [ ] Test with Postman/Insomnia
- [ ] Generate OpenAPI docs
- [ ] Create API usage examples

---

## Code Templates & Patterns

### Route Handler Pattern

```typescript
// From: apps/api/src/routes/companies.ts (existing pattern)

router.post('/tax/analyses', authMiddleware, async (req: Request, res: Response) => {
  try {
    // 1. Validate request
    const validated = createTaxAnalysisSchema.parse(req.body);

    // 2. Check authorization
    if (!canAccessCompany(req.user!.id, validated.companyId, req.user!.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this company',
      });
    }

    // 3. Call service
    const result = await TaxAnalysisService.create(
      validated,
      req.user!.id,
      req.user!.role
    );

    // 4. Return response
    return res.status(201).json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Create analysis error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create analysis',
    });
  }
});
```

### Service Method Pattern

```typescript
export class TaxAnalysisService {
  static async create(
    input: CreateTaxAnalysisInput,
    userId: string,
    role: string
  ): Promise<TaxAnalysis> {
    try {
      // 1. Verify company exists and user has access
      const company = await db.company.findUnique({
        where: { id: input.companyId }
      });
      if (!company) throw new Error('Company not found');

      // 2. Check access
      const hasAccess = role === 'ADMIN' ||
        company.ownerId === userId ||
        company.accountants.some(a => a.userId === userId);
      if (!hasAccess) throw new Error('Not authorized');

      // 3. Calculate taxes
      const calculations = TaxCalculationService.compareRegimes({
        grossRevenue: input.grossRevenue,
        expenses: input.expenses,
        deductions: input.deductions,
        taxCredits: input.taxCredits,
        previousPayments: input.previousPayments,
        sector: input.sector,
      });

      // 4. Create analysis record
      const analysis = await db.taxAnalysis.create({
        data: {
          companyId: input.companyId,
          year: input.year,
          grossRevenue: input.grossRevenue,
          expenses: input.expenses,
          deductions: input.deductions,
          taxCredits: input.taxCredits,
          previousPayments: input.previousPayments,
          sector: input.sector,
          analysisType: input.analysisType,
          notes: input.notes,
          simplasNacional: calculations.simplasNacional,
          lucroPresumido: calculations.lucroPresumido,
          lucroReal: calculations.lucroReal,
          recommendedRegime: calculations.recommendedRegime,
          estimatedSavings: calculations.estimatedSavings,
          analysisDetails: calculations.analysisDetails,
          createdBy: userId,
          status: 'COMPLETED',
        }
      });

      // 5. Detect opportunities
      const opportunities = await TaxOpportunityService.detectAllOpportunities(
        analysis,
        company
      );

      // 6. Store opportunities
      for (const opp of opportunities) {
        await db.taxOpportunity.create({
          data: {
            analysisId: analysis.id,
            category: opp.category,
            title: opp.title,
            description: opp.description,
            estimatedSavings: opp.estimatedSavings,
            implementationCost: opp.implementationCost,
            roi: opp.roi,
            riskLevel: opp.riskLevel,
            implementationEffort: opp.implementationEffort,
            applicableRegimes: opp.applicableRegimes,
            requirements: opp.requirements,
            taxBreak: opp.taxBreak,
            timeline: opp.timeline,
            priority: opp.priority,
            actionItems: opp.actionItems,
            successMetrics: opp.successMetrics,
          }
        });
      }

      return analysis;
    } catch (error) {
      throw new Error(`Failed to create analysis: ${error.message}`);
    }
  }
}
```

### TaxOpportunityService Pattern

```typescript
export class TaxOpportunityService {
  static async detectDeductions(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]> {
    const opportunities: TaxOpportunity[] = [];

    // Home Office Deduction
    const homeOffice = {
      id: 'home-office',
      title: 'Home Office Deduction',
      description: 'Deduct home office expenses',
      estimatedSavings: Math.min(analysis.expenses * 0.07, 1200000), // Max R$12k/year
      implementationCost: 0,
      riskLevel: 'MEDIUM' as const,
      implementationEffort: 'LOW' as const,
      applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
      requirements: [
        'Work exclusively from home',
        'Document space allocation',
        'Track utility proportions'
      ],
      timeline: 'Immediate',
    };

    homeOffice.roi = (homeOffice.estimatedSavings / Math.max(homeOffice.implementationCost, 1)) * 100;
    homeOffice.priority = this.scorePriority(homeOffice);

    opportunities.push(homeOffice);

    // Add more deduction types...
    return opportunities;
  }

  static scorePriority(opportunity: any): number {
    let score = 5;
    score += Math.min(opportunity.roi / 50, 3); // ROI bonus
    const effortMap = { 'LOW': 0, 'MEDIUM': -1, 'HIGH': -2 };
    const riskMap = { 'LOW': 0, 'MEDIUM': -0.5, 'HIGH': -1.5 };
    score += effortMap[opportunity.implementationEffort];
    score += riskMap[opportunity.riskLevel];
    return Math.max(1, Math.min(10, score));
  }
}
```

---

## Key Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `docs/architecture/tax-api-architecture.md` | Complete architecture design | 1000+ |
| `docs/openapi/tax-api-spec.yaml` | Full OpenAPI specification | 800+ |
| `apps/api/src/services/TaxCalculationService.ts` | Tax calculation engine (existing) | 800+ |
| `apps/api/src/routes/companies.ts` | Reference route pattern | 340 |
| `apps/api/src/middleware/auth.ts` | Authentication pattern | 110 |
| `apps/api/src/middleware/rbac.ts` | Authorization pattern | 100 |

---

## Testing Strategy

### Unit Tests (Services)

```typescript
describe('TaxAnalysisService', () => {
  describe('create', () => {
    it('should create analysis with all calculations', async () => {
      const input = { /* ... */ };
      const result = await TaxAnalysisService.create(input, userId, 'EMPRESARIO');
      expect(result.id).toBeDefined();
      expect(result.recommendedRegime).toBeDefined();
      expect(result.status).toBe('COMPLETED');
    });

    it('should deny access if user cannot access company', async () => {
      const input = { companyId: 'unauthorized-company' };
      expect(() => TaxAnalysisService.create(input, userId, 'EMPRESARIO'))
        .rejects.toThrow('Not authorized');
    });

    it('should calculate opportunities', async () => {
      const result = await TaxAnalysisService.create(input, userId, 'EMPRESARIO');
      const opps = await db.taxOpportunity.findMany({
        where: { analysisId: result.id }
      });
      expect(opps.length).toBeGreaterThan(0);
    });
  });
});
```

### Integration Tests (Routes)

```typescript
describe('POST /api/v1/tax/analyses', () => {
  it('should create analysis and return 201', async () => {
    const response = await request(app)
      .post('/api/v1/tax/analyses')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* valid input */ });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.analysis.id).toBeDefined();
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/v1/tax/analyses')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* missing required fields */ });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });
});
```

---

## Debugging Tips

### Check Database Schema
```bash
npx prisma studio  # Web UI to inspect data
```

### Test API Endpoints
```bash
# Create analysis
curl -X POST http://localhost:3000/api/v1/tax/analyses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "...",
    "year": 2024,
    "grossRevenue": 500000000,
    "sector": "SERVIÇO",
    "analysisType": "ANNUAL"
  }'
```

### Enable Debug Logging
```typescript
// In services
console.log('Creating analysis:', input);
console.log('Calculations:', calculations);
console.log('Stored analysis:', result);
```

---

## Common Issues & Solutions

### Issue: "Company not found"
**Solution**: Verify companyId exists and user has access

### Issue: "Cannot access property of undefined"
**Solution**: Check Prisma relations are loaded (use `.include()`)

### Issue: Validation fails with "Invalid enum value"
**Solution**: Verify enum values match Prisma schema exactly

### Issue: Opportunities are empty
**Solution**: Check TaxOpportunityService logic - may need to add more deduction rules

---

## Success Criteria

✅ All 8 endpoints implemented and tested
✅ 30+ test cases passing (unit + integration)
✅ TaxOpportunityService detects all opportunity types
✅ Authorization checks working (EMPRESARIO, CONTADOR, ADMIN)
✅ Validation schemas enforce input constraints
✅ Error responses follow standard format
✅ Pagination working on list endpoints
✅ OpenAPI docs accessible

---

## Next Steps After Implementation

1. **Phase 2 - Frontend**: Create React components for analysis display
2. **Phase 3 - Reporting**: PDF generation for analyses
3. **Phase 4 - Testing**: End-to-end test coverage
4. **Phase 5 - Deployment**: Deploy to staging/production

---

**Architecture Document**: `docs/architecture/tax-api-architecture.md`
**OpenAPI Spec**: `docs/openapi/tax-api-spec.yaml`
**Ready to implement**: YES ✅
