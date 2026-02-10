import { PrismaClient, TaxAnalysis, Company } from '@prisma/client';

const db = new PrismaClient();

export interface TaxOpportunity {
  category: string;
  title: string;
  description: string;
  estimatedSavings: number;
  implementationCost: number;
  roi: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
  applicableRegimes: string[];
  requirements: string[];
  taxBreak: string;
  timeline: string;
  priority: number;
  actionItems: string[];
  successMetrics: string[];
}

interface OpportunitiesResult {
  opportunities: any[];
  summary: {
    totalOpportunities: number;
    potentialAnnualSavings: number;
    highPriorityCount: number;
    implementableNow: number;
  };
}

export class TaxOpportunityService {
  /**
   * Detect all opportunities for an analysis
   */
  static async detectAllOpportunities(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]> {
    const opportunities: TaxOpportunity[] = [];

    // Detect each type
    const deductions = await this.detectDeductions(analysis, company);
    const credits = await this.detectCredits(analysis, company);
    const timing = await this.detectTimingStrategies(analysis, company);
    const expense = await this.detectExpenseOptimizations(analysis, company);

    opportunities.push(...deductions, ...credits, ...timing, ...expense);

    // Score and sort by priority
    opportunities.forEach(opp => {
      opp.priority = this.scorePriority(opp);
    });

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Detect deduction opportunities
   */
  static async detectDeductions(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]> {
    const opportunities: TaxOpportunity[] = [];
    const grossRevenue = Number(analysis.grossRevenue);
    const expenses = Number(analysis.expenses);

    // Home Office Deduction
    const homeOffice: TaxOpportunity = {
      category: 'DEDUCTION',
      title: 'Home Office Deduction',
      description: 'Deduct home office expenses including rent, utilities, and internet',
      estimatedSavings: Math.min(expenses * 0.07, 1200000), // Max R$12k/year in centavos
      implementationCost: 0,
      roi: 100, // Free to implement
      riskLevel: 'MEDIUM',
      implementationEffort: 'LOW',
      applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
      requirements: [
        'Work exclusively from home',
        'Document space allocation (percentage of house)',
        'Track utility proportions (electricity, water, internet)',
        'Keep rental contracts and utility bills',
      ],
      taxBreak: 'Art. 12-E, Lei nº 14.754/2023 - Home office deduction',
      timeline: 'Immediate',
      priority: 7,
      actionItems: [
        'Calculate home office percentage',
        'Gather utility bills and rental contract',
        'Document in tax records',
      ],
      successMetrics: [
        'Deduction approved by tax authority',
        'Reduce taxable income',
      ],
    };
    opportunities.push(homeOffice);

    // Equipment Depreciation
    if (expenses > 5000000) { // Only if significant expenses
      const depreciation: TaxOpportunity = {
        category: 'DEDUCTION',
        title: 'Equipment Depreciation',
        description: 'Depreciate business equipment, machinery, and furniture',
        estimatedSavings: Math.min(expenses * 0.05, 5000000), // 5% of expenses, max R$50k
        implementationCost: 100000, // Accounting cost ~R$1k
        roi: (Math.min(expenses * 0.05, 5000000) - 100000) / 100000 * 100,
        riskLevel: 'LOW',
        implementationEffort: 'MEDIUM',
        applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
        requirements: [
          'Equipment cost > R$1,000',
          'Document purchase date, cost, and useful life',
          'Create depreciation schedule',
          'Keep equipment inventory',
        ],
        taxBreak: 'Art. 305-309, RIR/1999 - Depreciation of assets',
        timeline: '30 days',
        priority: 6,
        actionItems: [
          'Inventory all equipment and machinery',
          'Calculate depreciation schedules',
          'Create asset registry',
        ],
        successMetrics: [
          'Depreciation approved in tax audit',
          'Reduce annual taxable income',
        ],
      };
      opportunities.push(depreciation);
    }

    // R&D Tax Credit
    if (company.industry?.includes('TECNOLOG') || company.industry?.includes('INOV')) {
      const rdCredit: TaxOpportunity = {
        category: 'CREDIT',
        title: 'Research & Development Tax Credit',
        description: 'Tax credit for R&D spending under Lei do Bem (Law 11,196/05)',
        estimatedSavings: Math.round(expenses * 0.05 * 0.25), // 5% R&D spending, 25% of that as credit
        implementationCost: 500000, // ~R$5k for compliance
        roi: (Math.round(expenses * 0.05 * 0.25) - 500000) / 500000 * 100,
        riskLevel: 'MEDIUM',
        implementationEffort: 'HIGH',
        applicableRegimes: ['LUCRO_REAL'],
        requirements: [
          'Document R&D projects and activities',
          'Track R&D-related expenses',
          'Annual compliance reporting to INPI',
          'Technical documentation of innovations',
        ],
        taxBreak: 'Lei nº 11,196/2005 - Tax incentives for innovation',
        timeline: 'Next quarter',
        priority: 8,
        actionItems: [
          'Document all R&D projects',
          'Create expense tracking system',
          'Prepare documentation for INPI',
        ],
        successMetrics: [
          'INPI approval of R&D projects',
          'Tax credit applied to annual tax',
        ],
      };
      opportunities.push(rdCredit);
    }

    return opportunities;
  }

  /**
   * Detect available tax credits
   */
  static async detectCredits(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]> {
    const opportunities: TaxOpportunity[] = [];
    const grossRevenue = Number(analysis.grossRevenue);

    // Regional Development Credit (SUDENE/SUDAM)
    const isNortheast = company.state?.match(/BA|SE|PE|AL|PB|RN|CE|PI|MA/);
    const isNorth = company.state?.match(/AM|RR|AP|PA|TO|AC|RO/);

    if (isNortheast) {
      const sudeneCredit: TaxOpportunity = {
        category: 'CREDIT',
        title: 'SUDENE Regional Development Credit',
        description: 'Tax credit for businesses in Northeast region (up to 75% of IRPJ)',
        estimatedSavings: Math.round(grossRevenue * 0.34 * 0.75), // 34% tax rate * 75% credit
        implementationCost: 3000000, // R$30k for legal/tax advisory
        roi: (Math.round(grossRevenue * 0.34 * 0.75) - 3000000) / 3000000 * 100,
        riskLevel: 'MEDIUM',
        implementationEffort: 'HIGH',
        applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
        requirements: [
          'Business located in Northeast region',
          'Meet SUDENE income requirements',
          'File SUDENE pre-approval request',
          'Annual compliance reporting',
        ],
        taxBreak: 'Lei Complementar nº 125/2007 - SUDENE benefits',
        timeline: 'Next quarter',
        priority: 9,
        actionItems: [
          'Check SUDENE eligibility',
          'File pre-approval request',
          'Engage regional tax advisor',
        ],
        successMetrics: [
          'SUDENE approval obtained',
          'Credit applied to tax returns',
        ],
      };
      opportunities.push(sudeneCredit);
    }

    // Export Credit
    if (company.description?.includes('export') || company.description?.includes('internacional')) {
      const exportCredit: TaxOpportunity = {
        category: 'CREDIT',
        title: 'Export Tax Credit',
        description: 'Tax credit or exemption for export-related activities',
        estimatedSavings: Math.round(grossRevenue * 0.10 * 0.25), // Estimated 10% export revenue, 25% benefit
        implementationCost: 1000000, // R$10k
        roi: (Math.round(grossRevenue * 0.10 * 0.25) - 1000000) / 1000000 * 100,
        riskLevel: 'LOW',
        implementationEffort: 'MEDIUM',
        applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
        requirements: [
          'Active export contracts',
          'Export documentation (invoices, shipping)',
          'Payment proof in foreign currency',
        ],
        taxBreak: 'Lei de Modernização Tributária - Export incentives',
        timeline: 'Immediate',
        priority: 7,
        actionItems: [
          'Quantify export revenue',
          'Organize export documentation',
          'File export credit claims',
        ],
        successMetrics: [
          'Export credit approved',
          'Reduced tax liability on export revenue',
        ],
      };
      opportunities.push(exportCredit);
    }

    return opportunities;
  }

  /**
   * Detect timing strategies
   */
  static async detectTimingStrategies(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]> {
    const opportunities: TaxOpportunity[] = [];
    const grossRevenue = Number(analysis.grossRevenue);
    const taxRate = 0.34; // IRPJ + CSLL

    // Revenue Deferral Strategy
    if (grossRevenue > 5000000) { // Only for significant companies
      const revenueDeferral: TaxOpportunity = {
        category: 'TIMING',
        title: 'Strategic Revenue Deferral',
        description: 'Defer invoicing of large contracts to next year for tax optimization',
        estimatedSavings: Math.round((grossRevenue * 0.10) * taxRate), // 10% of revenue deferred * tax rate
        implementationCost: 0,
        roi: 100,
        riskLevel: 'HIGH',
        implementationEffort: 'MEDIUM',
        applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
        requirements: [
          'Large contracts > R$500k',
          'Flexible billing terms with clients',
          'Strong cash flow management',
          'Proper documentation of deferral',
        ],
        taxBreak: 'Art. 12 Lei nº 9,250/1995 - Revenue recognition',
        timeline: 'Next quarter',
        priority: 4, // Lower priority due to high risk
        actionItems: [
          'Identify deferrable contracts',
          'Negotiate flexible payment terms',
          'Document commercial rationale',
        ],
        successMetrics: [
          'Deferred revenue properly documented',
          'Reduced current year tax liability',
        ],
      };
      opportunities.push(revenueDeferral);
    }

    // Expense Acceleration
    const yearEndAcceleration: TaxOpportunity = {
      category: 'TIMING',
      title: 'Year-End Expense Acceleration',
      description: 'Accelerate deductible expenses before year-end for immediate tax benefit',
      estimatedSavings: Math.round(Math.min(Number(analysis.expenses) * 0.15, 5000000) * taxRate),
      implementationCost: 0,
      roi: 100,
      riskLevel: 'LOW',
      implementationEffort: 'LOW',
      applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
      requirements: [
        'Planned expenses > R$100k',
        'Strong supplier relationships',
        'Available cash flow',
        'Documented business need',
      ],
      taxBreak: 'Art. 13 Lei nº 8,981/1995 - Expense recognition',
      timeline: 'Immediate',
      priority: 8,
      actionItems: [
        'Identify discretionary expenses',
        'Negotiate delivery schedules',
        'Execute contracts before year-end',
      ],
      successMetrics: [
        'Expenses properly deducted',
        'Reduced year-end tax',
      ],
    };
    opportunities.push(yearEndAcceleration);

    return opportunities;
  }

  /**
   * Detect expense optimization opportunities
   */
  static async detectExpenseOptimizations(
    analysis: TaxAnalysis,
    company: Company
  ): Promise<TaxOpportunity[]> {
    const opportunities: TaxOpportunity[] = [];
    const expenses = Number(analysis.expenses);

    // Contractor vs Employee Analysis
    const estimatedPayroll = expenses * 0.40; // Assume 40% of expenses is labor-related

    if (estimatedPayroll > 10000000) { // Only if significant payroll
      const contractorAnalysis: TaxOpportunity = {
        category: 'EXPENSE_OPTIMIZATION',
        title: 'Contractor vs Employee Cost Analysis',
        description: 'Evaluate hiring contractors instead of employees for specific roles',
        estimatedSavings: Math.round(estimatedPayroll * 0.20), // Potential 20% savings
        implementationCost: 500000, // HR restructuring cost ~R$5k
        roi: (Math.round(estimatedPayroll * 0.20) - 500000) / 500000 * 100,
        riskLevel: 'MEDIUM',
        implementationEffort: 'MEDIUM',
        applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
        requirements: [
          'Regular service need (6+ months)',
          'Clearly defined project scope',
          'Contractor available in market',
          'Proper legal documentation',
        ],
        taxBreak: 'Lei nº 8,212/1991 - Contractor vs employee classification',
        timeline: '30 days',
        priority: 6,
        actionItems: [
          'Identify roles suitable for contractors',
          'Compare costs (employee vs contractor)',
          'Ensure legal compliance',
        ],
        successMetrics: [
          'Cost reduction achieved',
          'No labor compliance issues',
        ],
      };
      opportunities.push(contractorAnalysis);
    }

    // Equipment Lease vs Purchase
    const equipmentBudget = expenses * 0.10; // Assume 10% on equipment

    if (equipmentBudget > 2000000) { // Only if significant equipment spending
      const leaseAnalysis: TaxOpportunity = {
        category: 'EXPENSE_OPTIMIZATION',
        title: 'Equipment Lease vs Purchase Analysis',
        description: 'Compare benefits of leasing vs purchasing equipment',
        estimatedSavings: Math.round(equipmentBudget * 0.15), // Typical 15% savings
        implementationCost: 200000, // Analysis cost ~R$2k
        roi: (Math.round(equipmentBudget * 0.15) - 200000) / 200000 * 100,
        riskLevel: 'LOW',
        implementationEffort: 'MEDIUM',
        applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
        requirements: [
          'Equipment cost > R$500k',
          'Lease providers available',
          'Technology may become obsolete',
          'Regular equipment replacement',
        ],
        taxBreak: 'Art. 305-309 RIR/1999 - Lease vs depreciation',
        timeline: '30 days',
        priority: 6,
        actionItems: [
          'Get lease quotes',
          'Compare TCO (total cost of ownership)',
          'Evaluate equipment lifecycle',
        ],
        successMetrics: [
          'Lower total equipment costs',
          'Improved cash flow',
        ],
      };
      opportunities.push(leaseAnalysis);
    }

    // Service Outsourcing
    const serviceCosts = expenses * 0.20; // Assume 20% on services

    if (serviceCosts > 5000000) { // Only if significant service spending
      const outsourcingAnalysis: TaxOpportunity = {
        category: 'EXPENSE_OPTIMIZATION',
        title: 'Service Outsourcing Opportunity',
        description: 'Outsource non-core services to reduce overhead',
        estimatedSavings: Math.round(serviceCosts * 0.25), // Typical 25% savings
        implementationCost: 1000000, // Transition cost ~R$10k
        roi: (Math.round(serviceCosts * 0.25) - 1000000) / 1000000 * 100,
        riskLevel: 'MEDIUM',
        implementationEffort: 'HIGH',
        applicableRegimes: ['LUCRO_REAL', 'LUCRO_PRESUMIDO'],
        requirements: [
          'Non-core service spending > R$500k',
          'Quality service providers available',
          'Service SLA requirements clear',
          'Proper vendor contracts',
        ],
        taxBreak: 'Lei nº 12,973/2014 - Service outsourcing',
        timeline: 'Next quarter',
        priority: 5,
        actionItems: [
          'Identify non-core services',
          'Request RFP from vendors',
          'Evaluate vendor capabilities',
        ],
        successMetrics: [
          'Service cost reduction',
          'Improved service quality',
        ],
      };
      opportunities.push(outsourcingAnalysis);
    }

    return opportunities;
  }

  /**
   * Get opportunities for an analysis with filters
   */
  static async getOpportunitiesForAnalysis(
    analysisId: string,
    filters: any,
    userId: string,
    userRole: string
  ): Promise<OpportunitiesResult | null> {
    try {
      // Verify access
      const analysis = await db.taxAnalysis.findUnique({
        where: { id: analysisId },
        include: {
          company: {
            include: {
              accountants: { where: { userId } },
            },
          },
          opportunities: true,
        },
      });

      if (!analysis) return null;

      const hasAccess = userRole === 'ADMIN' ||
        analysis.company.ownerId === userId ||
        analysis.company.accountants.length > 0;

      if (!hasAccess) {
        throw new Error('Not authorized to access this analysis');
      }

      // Load and filter opportunities
      let opportunities = analysis.opportunities;

      if (filters.category) {
        opportunities = opportunities.filter((o: any) => o.category === filters.category);
      }

      if (filters.riskLevel) {
        opportunities = opportunities.filter((o: any) => o.riskLevel === filters.riskLevel);
      }

      if (filters.minROI !== undefined) {
        opportunities = opportunities.filter((o: any) => (o.roi || 0) >= filters.minROI);
      }

      // Calculate summary
      const summary = {
        totalOpportunities: opportunities.length,
        potentialAnnualSavings: opportunities.reduce((sum: number, o: any) =>
          sum + Number(o.estimatedSavings || 0), 0
        ),
        highPriorityCount: opportunities.filter((o: any) => (o.priority || 0) >= 7).length,
        implementableNow: opportunities.filter((o: any) => o.timeline === 'Immediate').length,
      };

      return {
        opportunities,
        summary,
      };
    } catch (error: any) {
      throw new Error(`Failed to get opportunities: ${error.message}`);
    }
  }

  /**
   * Calculate ROI for an opportunity
   */
  static calculateROI(estimatedSavings: number, implementationCost: number): number {
    if (implementationCost === 0) return 100;
    return (estimatedSavings - implementationCost) / implementationCost * 100;
  }

  /**
   * Score opportunity by priority (1-10)
   */
  static scorePriority(opportunity: TaxOpportunity): number {
    let score = 5; // Base score

    // ROI bonus (0-3 points)
    score += Math.min(opportunity.roi / 50, 3);

    // Effort penalty (0-2 points)
    const effortPenalty: Record<string, number> = {
      'LOW': 0,
      'MEDIUM': -1,
      'HIGH': -2,
    };
    score += effortPenalty[opportunity.implementationEffort] || 0;

    // Risk penalty (0-2 points)
    const riskPenalty: Record<string, number> = {
      'LOW': 0,
      'MEDIUM': -0.5,
      'HIGH': -1.5,
    };
    score += riskPenalty[opportunity.riskLevel] || 0;

    return Math.max(1, Math.min(10, Math.round(score)));
  }
}
