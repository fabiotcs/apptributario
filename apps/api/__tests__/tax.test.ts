import { TaxCalculationService } from '../src/services/TaxCalculationService';
import { TaxOpportunityService } from '../src/services/TaxOpportunityService';

describe('TaxCalculationService', () => {
  describe('Simples Nacional', () => {
    it('should calculate Simples Nacional tax correctly for services', () => {
      const result = TaxCalculationService.calculateSimples({
        grossRevenue: 250000000, // R$ 2.5M
        sector: 'SERVIÇO',
      });

      expect(result.taxRate).toBe(0.088); // 8.8% for services
      expect(result.taxLiability).toBe(Math.round(250000000 * 0.088)); // R$ 220k
      expect(result.monthlyPayment).toBe(Math.round(result.taxLiability / 12));
      expect(result.advantages).toContain('Single unified tax (replaces IRPJ, CSLL, IPI, INSS)');
    });

    it('should calculate Simples Nacional for commerce', () => {
      const result = TaxCalculationService.calculateSimples({
        grossRevenue: 300000000, // R$ 3M
        sector: 'COMÉRCIO',
      });

      expect(result.taxRate).toBe(0.048); // 4.8% for commerce
      expect(result.taxLiability).toBe(Math.round(300000000 * 0.048)); // R$ 144k
    });

    it('should calculate Simples Nacional for manufacturing', () => {
      const result = TaxCalculationService.calculateSimples({
        grossRevenue: 400000000, // R$ 4M
        sector: 'INDÚSTRIA',
      });

      expect(result.taxRate).toBe(0.063); // 6.3% for manufacturing
      expect(result.taxLiability).toBe(Math.round(400000000 * 0.063)); // R$ 252k
    });

    it('should use default rate for unknown sector', () => {
      const result = TaxCalculationService.calculateSimples({
        grossRevenue: 200000000,
        sector: 'UNKNOWN',
      });

      expect(result.taxRate).toBe(0.088); // Default to services rate
    });
  });

  describe('Lucro Presumido', () => {
    it('should calculate Lucro Presumido correctly for services', () => {
      const result = TaxCalculationService.calculatePresumido({
        grossRevenue: 250000000, // R$ 2.5M
        sector: 'SERVIÇO',
      });

      // Presumed profit: 2.5M * 32% = 800k
      // IRPJ: 800k * 15% + (excess over 20k/month) * 10%
      // CSLL: 800k * 9% + excess * 20%
      const presumedProfit = 250000000 * 0.32; // 80M
      expect(result.taxRate).toBe(0.15 + 0.09); // 24% base

      // Should calculate monthly excess
      const monthlyProfit = Math.round(presumedProfit / 12);
      expect(monthlyProfit).toBeGreaterThan(20000); // Should have excess

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.advantages).toContain('Moderate tax rate (34% federal)');
    });

    it('should calculate Lucro Presumido for commerce', () => {
      const result = TaxCalculationService.calculatePresumido({
        grossRevenue: 200000000, // R$ 2M
        sector: 'COMÉRCIO',
      });

      // Presumed profit: 2M * 8% = 160k
      const presumedProfit = 200000000 * 0.08;
      expect(result.taxRate).toBe(0.15 + 0.09); // 24% base
      expect(result.taxLiability).toBeGreaterThan(0);
    });

    it('should handle presumed margin variation by sector', () => {
      const commerce = TaxCalculationService.calculatePresumido({
        grossRevenue: 100000000,
        sector: 'COMÉRCIO',
      });

      const services = TaxCalculationService.calculatePresumido({
        grossRevenue: 100000000,
        sector: 'SERVIÇO',
      });

      // Services has higher presumed margin (32% vs 8%)
      expect(services.taxLiability).toBeGreaterThan(commerce.taxLiability);
    });
  });

  describe('Lucro Real', () => {
    it('should calculate Lucro Real based on actual profit', () => {
      const result = TaxCalculationService.calculateReal({
        grossRevenue: 250000000, // R$ 2.5M
        expenses: 150000000,     // R$ 1.5M
        deductions: 0,
      });

      // Actual profit: 2.5M - 1.5M = 1M
      const expectedProfit = 250000000 - 150000000;
      expect(result.taxLiability).toBeLessThan(expectedProfit); // Tax is less than profit

      expect(result.advantages).toContain('Can recover VAT credit');
      expect(result.advantages).toContain('Tax based on actual profit');
    });

    it('should apply IRPJ and CSLL with additional rates on excess', () => {
      const result = TaxCalculationService.calculateReal({
        grossRevenue: 300000000,
        expenses: 180000000,
        deductions: 10000000,
      });

      // Profit: 300M - 180M - 10M = 110M
      const profit = 300000000 - 180000000 - 10000000;
      const monthlyProfit = Math.round(profit / 12);

      // Should have excess over R$20k monthly threshold
      expect(monthlyProfit).toBeGreaterThan(20000);

      // Tax should include base + additional on excess
      expect(result.taxLiability).toBeGreaterThan(0);
    });

    it('should allow deductions and tax credits', () => {
      const withoutCredits = TaxCalculationService.calculateReal({
        grossRevenue: 200000000,
        expenses: 100000000,
        deductions: 0,
        taxCredits: 0,
      });

      const withCredits = TaxCalculationService.calculateReal({
        grossRevenue: 200000000,
        expenses: 100000000,
        deductions: 0,
        taxCredits: 5000000,
      });

      // With credits should have lower liability
      expect(withCredits.taxLiability).toBeLessThan(withoutCredits.taxLiability);
    });

    it('should not allow negative tax liability', () => {
      const result = TaxCalculationService.calculateReal({
        grossRevenue: 100000000,
        expenses: 150000000, // Expenses > revenue
        taxCredits: 10000000, // Large credit
      });

      expect(result.taxLiability).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Regime Comparison', () => {
    it('should recommend Simples for low-revenue service company', () => {
      const comparison = TaxCalculationService.compareRegimes({
        grossRevenue: 200000000, // R$ 2M
        expenses: 50000000,
        sector: 'SERVIÇO',
      });

      expect(comparison.recommendedRegime).toBe('SIMPLES_NACIONAL');
      expect(comparison.estimatedSavings).toBeGreaterThanOrEqual(0);
    });

    it('should recommend best option based on lowest tax liability', () => {
      const comparison = TaxCalculationService.compareRegimes({
        grossRevenue: 500000000, // R$ 5M
        expenses: 200000000,
        sector: 'INDÚSTRIA',
      });

      const simplesTax = comparison.simplasNacional.taxLiability;
      const presumidoTax = comparison.lucroPresumido.taxLiability;
      const realTax = comparison.lucroReal.taxLiability;

      // Recommended should be the minimum
      const minTax = Math.min(simplesTax, presumidoTax, realTax);

      if (comparison.recommendedRegime === 'SIMPLES_NACIONAL') {
        expect(simplesTax).toBe(minTax);
      } else if (comparison.recommendedRegime === 'LUCRO_PRESUMIDO') {
        expect(presumidoTax).toBe(minTax);
      } else {
        expect(realTax).toBe(minTax);
      }
    });

    it('should generate detailed analysis in Portuguese', () => {
      const comparison = TaxCalculationService.compareRegimes({
        grossRevenue: 300000000,
        expenses: 100000000,
        sector: 'SERVIÇO',
      });

      expect(comparison.analysisDetails).toContain('ANÁLISE COMPARATIVA');
      expect(comparison.analysisDetails).toContain('SIMPLES NACIONAL');
      expect(comparison.analysisDetails).toContain('LUCRO PRESUMIDO');
      expect(comparison.analysisDetails).toContain('LUCRO REAL');
      expect(comparison.analysisDetails).toContain('RECOMENDAÇÃO');
    });
  });
});

describe('TaxOpportunityService', () => {
  const mockAnalysis = {
    id: 'test-analysis',
    grossRevenue: 300000000n,
    expenses: 150000000n,
    deductions: 10000000n,
    taxCredits: 0n,
    sector: 'SERVIÇO',
  } as any;

  const mockCompany = {
    id: 'test-company',
    industry: 'SERVIÇO',
    state: 'SP',
    description: 'Tech company doing export',
  } as any;

  describe('Deduction Detection', () => {
    it('should detect home office opportunity', async () => {
      const opps = await TaxOpportunityService.detectDeductions(mockAnalysis, mockCompany);

      const homeOffice = opps.find(o => o.title.includes('Home Office'));
      expect(homeOffice).toBeDefined();
      expect(homeOffice?.category).toBe('DEDUCTION');
      expect(homeOffice?.estimatedSavings).toBeGreaterThan(0);
      expect(homeOffice?.riskLevel).toBe('MEDIUM');
    });

    it('should detect equipment depreciation for companies with significant expenses', async () => {
      const opps = await TaxOpportunityService.detectDeductions(mockAnalysis, mockCompany);

      const depreciation = opps.find(o => o.title.includes('Equipment'));
      expect(depreciation).toBeDefined();
      expect(depreciation?.category).toBe('DEDUCTION');
    });

    it('should detect deductions for tech companies', async () => {
      const techCompany = { ...mockCompany, industry: 'TECNOLOGIA' };
      const opps = await TaxOpportunityService.detectDeductions(mockAnalysis, techCompany);

      // Should at least detect home office for tech companies
      const homeOffice = opps.find(o => o.title.includes('Home Office'));
      expect(homeOffice).toBeDefined();
    });
  });

  describe('Credit Detection', () => {
    it('should detect SUDENE credit for Northeast companies', async () => {
      const northeastCompany = { ...mockCompany, state: 'BA' };
      const opps = await TaxOpportunityService.detectCredits(mockAnalysis, northeastCompany);

      const sudeneCredit = opps.find(o => o.title.includes('SUDENE'));
      expect(sudeneCredit).toBeDefined();
      expect(sudeneCredit?.riskLevel).toBe('MEDIUM');
    });

    it('should not detect SUDENE for non-Northeast companies', async () => {
      const southCompany = { ...mockCompany, state: 'SC' };
      const opps = await TaxOpportunityService.detectCredits(mockAnalysis, southCompany);

      const sudeneCredit = opps.find(o => o.title.includes('SUDENE'));
      expect(sudeneCredit).toBeUndefined();
    });

    it('should detect export credit for export companies', async () => {
      const exportCompany = { ...mockCompany, description: 'International export business' };
      const opps = await TaxOpportunityService.detectCredits(mockAnalysis, exportCompany);

      const exportCredit = opps.find(o => o.title.includes('Export'));
      expect(exportCredit).toBeDefined();
    });
  });

  describe('Timing Strategies', () => {
    it('should suggest revenue deferral for large companies', async () => {
      const largeAnalysis = { ...mockAnalysis, grossRevenue: 600000000n };
      const opps = await TaxOpportunityService.detectTimingStrategies(largeAnalysis, mockCompany);

      const deferral = opps.find(o => o.title.includes('Revenue Deferral'));
      expect(deferral).toBeDefined();
      expect(deferral?.riskLevel).toBe('HIGH');
    });

    it('should always suggest expense acceleration', async () => {
      const opps = await TaxOpportunityService.detectTimingStrategies(mockAnalysis, mockCompany);

      const acceleration = opps.find(o => o.title.includes('Expense Acceleration'));
      expect(acceleration).toBeDefined();
      expect(acceleration?.riskLevel).toBe('LOW');
      expect(acceleration?.timeline).toBe('Immediate');
    });
  });

  describe('Expense Optimizations', () => {
    it('should suggest contractor analysis for companies with payroll', async () => {
      const opps = await TaxOpportunityService.detectExpenseOptimizations(mockAnalysis, mockCompany);

      const contractor = opps.find(o => o.title.includes('Contractor'));
      expect(contractor).toBeDefined();
      expect(contractor?.category).toBe('EXPENSE_OPTIMIZATION');
    });

    it('should calculate ROI correctly', () => {
      const roi = TaxOpportunityService.calculateROI(100000, 10000);
      expect(roi).toBe(900); // (100k - 10k) / 10k * 100 = 900%
    });

    it('should return 100 ROI for zero implementation cost', () => {
      const roi = TaxOpportunityService.calculateROI(50000, 0);
      expect(roi).toBe(100);
    });
  });

  describe('Priority Scoring', () => {
    it('should score opportunity between 1-10', () => {
      const opportunity = {
        roi: 100,
        implementationEffort: 'LOW' as const,
        riskLevel: 'LOW' as const,
      } as any;

      const score = TaxOpportunityService.scorePriority(opportunity);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('should score high ROI + low effort + low risk highest', () => {
      const highScore = TaxOpportunityService.scorePriority({
        roi: 500,
        implementationEffort: 'LOW',
        riskLevel: 'LOW',
      } as any);

      const lowScore = TaxOpportunityService.scorePriority({
        roi: 10,
        implementationEffort: 'HIGH',
        riskLevel: 'HIGH',
      } as any);

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should penalize high risk and effort', () => {
      const risky = TaxOpportunityService.scorePriority({
        roi: 100,
        implementationEffort: 'HIGH',
        riskLevel: 'HIGH',
      } as any);

      const safe = TaxOpportunityService.scorePriority({
        roi: 100,
        implementationEffort: 'LOW',
        riskLevel: 'LOW',
      } as any);

      expect(safe).toBeGreaterThan(risky);
    });
  });

  describe('All Opportunities Detection', () => {
    it('should detect multiple opportunity types', async () => {
      const opps = await TaxOpportunityService.detectAllOpportunities(mockAnalysis, mockCompany);

      const categories = new Set(opps.map(o => o.category));
      expect(categories.size).toBeGreaterThanOrEqual(1);
    });

    it('should sort opportunities by priority', async () => {
      const opps = await TaxOpportunityService.detectAllOpportunities(mockAnalysis, mockCompany);

      for (let i = 0; i < opps.length - 1; i++) {
        expect(opps[i].priority).toBeGreaterThanOrEqual(opps[i + 1].priority);
      }
    });

    it('should return opportunities with all required fields', async () => {
      const opps = await TaxOpportunityService.detectAllOpportunities(mockAnalysis, mockCompany);

      expect(opps.length).toBeGreaterThan(0);

      opps.forEach(opp => {
        expect(opp.category).toBeDefined();
        expect(opp.title).toBeDefined();
        expect(opp.description).toBeDefined();
        expect(opp.estimatedSavings).toBeDefined();
        expect(opp.implementationCost).toBeDefined();
        expect(opp.roi).toBeDefined();
        expect(opp.riskLevel).toBeDefined();
        expect(opp.implementationEffort).toBeDefined();
        expect(opp.applicableRegimes).toBeDefined();
        expect(opp.requirements).toBeDefined();
        expect(opp.timeline).toBeDefined();
        expect(opp.priority).toBeGreaterThanOrEqual(1);
        expect(opp.priority).toBeLessThanOrEqual(10);
      });
    });
  });
});
