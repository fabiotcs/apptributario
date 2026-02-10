import { PrismaClient, TaxAnalysis } from '@prisma/client';
import { TaxCalculationService } from './TaxCalculationService';
import { TaxOpportunityService } from './TaxOpportunityService';
import { CreateTaxAnalysisInput, UpdateTaxAnalysisInput, ForecastInput } from '../validators/tax.schemas';

const db = new PrismaClient();

interface ListResult {
  analyses: any[];
  total: number;
  page: number;
  limit: number;
}

interface FilingsResult {
  filings: any[];
  total: number;
  page: number;
  limit: number;
  summary: {
    totalPending: number;
    totalOverdue: number;
    nextDueDate: string | null;
    daysUntilNextDeadline: number | null;
  };
}

export class TaxAnalysisService {
  /**
   * Create a new tax analysis
   */
  static async create(
    input: CreateTaxAnalysisInput,
    userId: string,
    userRole: string
  ): Promise<any> {
    try {
      // Verify company exists and user has access
      const company = await db.company.findUnique({
        where: { id: input.companyId },
        include: {
          accountants: {
            where: { userId },
          },
        },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      // Check access control
      const hasAccess = userRole === 'ADMIN' ||
        company.ownerId === userId ||
        company.accountants.length > 0;

      if (!hasAccess) {
        throw new Error('Not authorized to access this company');
      }

      // Calculate taxes
      const calculations = TaxCalculationService.compareRegimes({
        grossRevenue: Number(input.grossRevenue),
        expenses: Number(input.expenses || 0n),
        deductions: Number(input.deductions || 0n),
        taxCredits: Number(input.taxCredits || 0n),
        previousPayments: Number(input.previousPayments || 0n),
        sector: input.sector,
      });

      // Create analysis record with related data
      const analysis = await db.taxAnalysis.create({
        data: {
          companyId: input.companyId,
          analysisType: input.analysisType,
          year: input.year,
          status: 'COMPLETED',

          // Create TaxData
          taxData: {
            create: {
              grossRevenue: input.grossRevenue,
              expenses: input.expenses || 0n,
              deductions: input.deductions || 0n,
              taxCredits: input.taxCredits || 0n,
              previousPayments: input.previousPayments || 0n,
            },
          },

          // Create TaxComparison
          comparison: {
            create: {
              simplasNacional: calculations.simplasNacional,
              lucroPresumido: calculations.lucroPresumido,
              lucroReal: calculations.lucroReal,
              recommendedRegime: calculations.recommendedRegime,
              estimatedSavings: BigInt(calculations.estimatedSavings),
              analysisDetails: calculations.analysisDetails,
            },
          },
        },
        include: {
          taxData: true,
          comparison: true,
          opportunities: true,
          company: true,
        },
      });

      // Detect and create opportunities
      const opportunities = await TaxOpportunityService.detectAllOpportunities(
        analysis,
        company
      );

      // Store opportunities
      for (const opp of opportunities) {
        await db.taxOpportunity.create({
          data: {
            analysisId: analysis.id,
            category: opp.category as any,
            opportunity: opp.title + '\n' + opp.description,
            estimatedValue: BigInt(Math.round(opp.estimatedSavings)),
            riskLevel: opp.riskLevel as any,
            implementation: opp.actionItems.join('\n'),
          },
        });
      }

      // Reload with opportunities
      return await db.taxAnalysis.findUnique({
        where: { id: analysis.id },
        include: {
          taxData: true,
          comparison: true,
          opportunities: true,
          company: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to create analysis: ${error.message}`);
    }
  }

  /**
   * List analyses with pagination and filters
   */
  static async list(
    filters: any,
    userId: string,
    userRole: string
  ): Promise<ListResult> {
    try {
      const { page, limit, companyId, year, status, search } = filters;
      const skip = ((page - 1) * limit) || 0;

      // Build query based on role
      let whereClause: any = {};

      if (userRole === 'ADMIN') {
        // Admin can see all
        if (companyId) whereClause.companyId = companyId;
      } else {
        // Users can only see their own companies' analyses
        const userCompanies = await db.company.findMany({
          where: {
            OR: [
              { ownerId: userId },
              { accountants: { some: { userId } } },
            ],
          },
          select: { id: true },
        });

        const companyIds = userCompanies.map(c => c.id);
        whereClause.companyId = { in: companyIds };

        if (companyId) {
          whereClause.companyId = companyId;
        }
      }

      if (year) whereClause.year = year;
      if (status) whereClause.status = status;

      // Get total count
      const total = await db.taxAnalysis.count({ where: whereClause });

      // Get paginated results
      const analyses = await db.taxAnalysis.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          taxData: true,
          comparison: true,
          company: true,
        },
      });

      return {
        analyses,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      throw new Error(`Failed to list analyses: ${error.message}`);
    }
  }

  /**
   * Get full analysis details
   */
  static async getById(
    analysisId: string,
    userId: string,
    userRole: string
  ): Promise<any | null> {
    try {
      const analysis = await db.taxAnalysis.findUnique({
        where: { id: analysisId },
        include: {
          company: {
            include: {
              accountants: {
                where: { userId },
              },
            },
          },
          taxData: true,
          comparison: true,
          opportunities: true,
        },
      });

      if (!analysis) return null;

      // Check access control
      const hasAccess = userRole === 'ADMIN' ||
        analysis.company.ownerId === userId ||
        analysis.company.accountants.length > 0;

      if (!hasAccess) {
        throw new Error('Not authorized to access this analysis');
      }

      return analysis;
    } catch (error: any) {
      throw new Error(`Failed to retrieve analysis: ${error.message}`);
    }
  }

  /**
   * Update analysis
   */
  static async update(
    analysisId: string,
    updates: UpdateTaxAnalysisInput,
    userId: string,
    userRole: string
  ): Promise<any | null> {
    try {
      const analysis = await db.taxAnalysis.findUnique({
        where: { id: analysisId },
        include: {
          company: {
            include: {
              accountants: { where: { userId } },
            },
          },
          taxData: true,
        },
      });

      if (!analysis) return null;

      // Check authorization
      if (updates.status === 'REVIEWED') {
        // Only CONTADOR/ADMIN can review
        const isCountador = userRole === 'CONTADOR' || userRole === 'ADMIN';
        const isAssignedAccountant = analysis.company.accountants.length > 0;

        if (!isCountador && !isAssignedAccountant) {
          throw new Error('Only accountants can review analyses');
        }
      }

      // Build update data
      const updateData: any = {};

      if (updates.status !== undefined) {
        updateData.status = updates.status;
        if (updates.status === 'REVIEWED') {
          updateData.accountantId = userId;
        }
      }

      // Recalculate if expenses changed
      if (updates.expenses !== undefined || updates.deductions !== undefined) {
        const taxData = analysis.taxData;
        const newExpenses = updates.expenses !== undefined ? updates.expenses : taxData?.expenses || 0n;
        const newDeductions = updates.deductions !== undefined ? updates.deductions : taxData?.deductions || 0n;
        const newCredits = updates.taxCredits !== undefined ? updates.taxCredits : taxData?.taxCredits || 0n;

        const calculations = TaxCalculationService.compareRegimes({
          grossRevenue: Number(taxData?.grossRevenue || 0n),
          expenses: Number(newExpenses),
          deductions: Number(newDeductions),
          taxCredits: Number(newCredits),
          previousPayments: 0,
          sector: analysis.company.industry || 'SERVIÇO',
        });

        // Update TaxData
        if (taxData) {
          await db.taxData.update({
            where: { analysisId },
            data: {
              expenses: newExpenses,
              deductions: newDeductions,
              taxCredits: newCredits,
            },
          });
        }

        // Update TaxComparison
        await db.taxComparison.update({
          where: { analysisId },
          data: {
            simplasNacional: calculations.simplasNacional,
            lucroPresumido: calculations.lucroPresumido,
            lucroReal: calculations.lucroReal,
            recommendedRegime: calculations.recommendedRegime,
            estimatedSavings: BigInt(calculations.estimatedSavings),
          },
        });
      }

      const updated = await db.taxAnalysis.update({
        where: { id: analysisId },
        data: updateData,
        include: {
          taxData: true,
          comparison: true,
          opportunities: true,
          company: true,
        },
      });

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to update analysis: ${error.message}`);
    }
  }

  /**
   * Get regime comparison details
   */
  static async getComparison(
    analysisId: string,
    userId: string,
    userRole: string
  ): Promise<any | null> {
    try {
      const analysis = await db.taxAnalysis.findUnique({
        where: { id: analysisId },
        include: {
          company: {
            include: {
              accountants: { where: { userId } },
            },
          },
          comparison: true,
        },
      });

      if (!analysis) return null;

      // Check access
      const hasAccess = userRole === 'ADMIN' ||
        analysis.company.ownerId === userId ||
        analysis.company.accountants.length > 0;

      if (!hasAccess) {
        throw new Error('Not authorized to access this analysis');
      }

      const comparison = analysis.comparison;
      if (!comparison) return null;

      return {
        analysisId: analysis.id,
        year: analysis.year,
        regimes: [
          {
            name: 'SIMPLES_NACIONAL',
            ...(comparison.simplasNacional as any),
          },
          {
            name: 'LUCRO_PRESUMIDO',
            ...(comparison.lucroPresumido as any),
          },
          {
            name: 'LUCRO_REAL',
            ...(comparison.lucroReal as any),
          },
        ],
        recommended: {
          regime: comparison.recommendedRegime,
          estimatedAnnualSavings: Number(comparison.estimatedSavings),
        },
        chartData: {
          labels: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'],
          taxLiabilities: [
            Number((comparison.simplasNacional as any).taxLiability || 0),
            Number((comparison.lucroPresumido as any).taxLiability || 0),
            Number((comparison.lucroReal as any).taxLiability || 0),
          ],
          monthlyPayments: [
            Number((comparison.simplasNacional as any).monthlyPayment || 0),
            Number((comparison.lucroPresumido as any).monthlyPayment || 0),
            Number((comparison.lucroReal as any).monthlyPayment || 0),
          ],
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to retrieve comparison: ${error.message}`);
    }
  }

  /**
   * List tax filings
   */
  static async listFilings(
    filters: any,
    userId: string,
    userRole: string
  ): Promise<FilingsResult> {
    try {
      const { page, limit, companyId, year, status, dueDateFrom, dueDateTo } = filters;
      const skip = ((page - 1) * limit) || 0;

      // Build query
      let whereClause: any = {};

      if (userRole === 'ADMIN') {
        if (companyId) whereClause.companyId = companyId;
      } else {
        // Users can only see filings for their companies
        const userCompanies = await db.company.findMany({
          where: {
            OR: [
              { ownerId: userId },
              { accountants: { some: { userId } } },
            ],
          },
          select: { id: true },
        });

        const companyIds = userCompanies.map(c => c.id);
        whereClause.companyId = { in: companyIds };

        if (companyId) {
          whereClause.companyId = companyId;
        }
      }

      if (year) whereClause.year = year;
      if (status) whereClause.status = status;

      if (dueDateFrom || dueDateTo) {
        whereClause.dueDate = {};
        if (dueDateFrom) whereClause.dueDate.gte = new Date(dueDateFrom);
        if (dueDateTo) whereClause.dueDate.lte = new Date(dueDateTo);
      }

      // Get total count
      const total = await db.taxFiling.count({ where: whereClause });

      // Get filings
      const filings = await db.taxFiling.findMany({
        where: whereClause,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      });

      // Enhance filings with calculated fields
      const enhancedFilings = filings.map(filing => {
        const now = new Date();
        const dueDate = new Date(filing.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...filing,
          daysUntilDue,
          isOverdue: daysUntilDue < 0,
        };
      });

      // Calculate summary
      const allFilings = await db.taxFiling.findMany({ where: whereClause });
      const now = new Date();
      const totalPending = allFilings.filter(f => f.status === 'PENDING').length;
      const totalOverdue = allFilings.filter(f => {
        const dueDate = new Date(f.dueDate);
        const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilDue < 0 && f.status === 'PENDING';
      }).length;

      const nextFiling = allFilings.find(f => f.status === 'PENDING');
      const nextDueDate = nextFiling ? nextFiling.dueDate.toISOString() : null;
      const daysUntilNextDeadline = nextFiling
        ? Math.ceil((new Date(nextFiling.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        filings: enhancedFilings,
        total,
        page,
        limit,
        summary: {
          totalPending,
          totalOverdue,
          nextDueDate,
          daysUntilNextDeadline,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to list filings: ${error.message}`);
    }
  }

  /**
   * Generate tax forecast
   */
  static async generateForecast(
    input: ForecastInput,
    userId: string,
    userRole: string
  ): Promise<any> {
    try {
      // Verify company access
      const company = await db.company.findUnique({
        where: { id: input.companyId },
        include: {
          accountants: { where: { userId } },
        },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      const hasAccess = userRole === 'ADMIN' ||
        company.ownerId === userId ||
        company.accountants.length > 0;

      if (!hasAccess) {
        throw new Error('Not authorized to access this company');
      }

      // Get most recent analysis for base data
      const latestAnalysis = await db.taxAnalysis.findFirst({
        where: { companyId: input.companyId },
        orderBy: { year: 'desc' },
        include: { taxData: true },
      });

      if (!latestAnalysis?.taxData) {
        throw new Error('No analysis found for forecasting');
      }

      const monthlyRevenue = input.projectedMonthlyRevenue || (Number(latestAnalysis.taxData.grossRevenue) / 12);
      const seasonality = input.seasonalityFactor || 1.0;
      const expenseGrowth = input.expectedExpenseGrowth || 0;

      const monthlyForecasts = [];
      const regimesToForecast = input.regimesToForecast || ['SIMPLES', 'PRESUMIDO', 'REAL'];

      for (let month = 1; month <= input.forecastMonths; month++) {
        const monthlyRevenueAdjusted = Math.round(monthlyRevenue * seasonality);
        const annualProjectedRevenue = monthlyRevenueAdjusted * 12;
        const projectedExpenses = Math.round(
          Number(latestAnalysis.taxData.expenses || 0n) * (1 + expenseGrowth)
        );

        const regimeTaxForecasts = [];

        for (const regime of regimesToForecast) {
          const calculations = TaxCalculationService.compareRegimes({
            grossRevenue: annualProjectedRevenue,
            expenses: projectedExpenses,
            deductions: Number(latestAnalysis.taxData.deductions || 0n),
            taxCredits: Number(latestAnalysis.taxData.taxCredits || 0n),
            previousPayments: 0,
            sector: company.industry || 'SERVIÇO',
          });

          let regimeData: any;
          if (regime === 'SIMPLES') {
            regimeData = calculations.simplasNacional;
          } else if (regime === 'PRESUMIDO') {
            regimeData = calculations.lucroPresumido;
          } else {
            regimeData = calculations.lucroReal;
          }

          regimeTaxForecasts.push({
            regime: regime === 'SIMPLES' ? 'SIMPLES_NACIONAL' : regime === 'PRESUMIDO' ? 'LUCRO_PRESUMIDO' : 'LUCRO_REAL',
            estimatedTax: regimeData.taxLiability,
            estimatedMonthlyPayment: Math.round(regimeData.taxLiability / 12),
            profitMargin: ((annualProjectedRevenue - projectedExpenses) / annualProjectedRevenue) * 100,
          });
        }

        monthlyForecasts.push({
          month,
          projectedRevenue: monthlyRevenueAdjusted,
          projectedExpenses: Math.round(projectedExpenses / 12),
          regimeTaxForecasts,
          recommendedRegime: 'SIMPLES_NACIONAL',
        });
      }

      return {
        id: `forecast-${input.companyId}-${Date.now()}`,
        companyId: input.companyId,
        baseYear: input.baseYear,
        generatedAt: new Date().toISOString(),
        monthlyForecasts,
        annualSummary: {
          totalProjectedRevenue: Math.round(monthlyRevenue * 12 * input.forecastMonths / input.forecastMonths),
          totalProjectedExpenses: Number(latestAnalysis.taxData.expenses || 0n),
          projectedProfit: Math.round(monthlyRevenue * 12 - Number(latestAnalysis.taxData.expenses || 0n)),
        },
        risks: [],
      };
    } catch (error: any) {
      throw new Error(`Failed to generate forecast: ${error.message}`);
    }
  }
}
