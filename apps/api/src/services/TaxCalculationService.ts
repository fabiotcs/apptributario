import { RegimeType } from '@prisma/client';

/**
 * Tax Calculation Service for Agente Tributário
 * Calculates tax liability for three Brazilian tax regimes:
 * - Simples Nacional
 * - Lucro Presumido
 * - Lucro Real
 */

// Tax rates (2024) - In thousandths (0.15 = 15%)
const TAX_RATES = {
  irpj: 0.15,        // 15% base
  irpjAdditional: 0.10, // 10% on profit > R$20K/month
  csll: 0.09,        // 9% base
  csllAdditional: 0.20, // 20% additional on profit > R$20K/month
};

// Sector-based tax rates for Simples Nacional
const SIMPLES_RATES: Record<string, number> = {
  'COMÉRCIO': 0.048,      // 4.8%
  'INDÚSTRIA': 0.063,     // 6.3%
  'SERVIÇO': 0.088,       // 8.8%
  'TRANSPORTES': 0.042,   // 4.2%
  'INTERMEDIAÇÃO': 0.062, // 6.2%
  'DEFAULT': 0.088,       // Default to services rate
};

// Presumed profit margins for Lucro Presumido by activity
const PRESUMED_MARGINS: Record<string, number> = {
  'COMÉRCIO': 0.08,       // 8%
  'INDÚSTRIA': 0.12,      // 12%
  'SERVIÇO': 0.32,        // 32%
  'TRANSPORTES': 0.16,    // 16%
  'INTERMEDIAÇÃO': 0.16,  // 16%
  'DEFAULT': 0.32,        // Default to services
};

interface TaxInput {
  grossRevenue: number;    // in centavos
  deductions?: number;     // in centavos
  expenses?: number;       // in centavos
  taxCredits?: number;     // in centavos
  previousPayments?: number; // in centavos
  sector?: string;
}

interface RegimeCalculation {
  taxRate: number;
  taxLiability: number;    // Annual tax in centavos
  monthlyPayment: number;  // Average monthly payment in centavos
  advantages: string[];
  disadvantages: string[];
}

interface TaxComparison {
  simplasNacional: RegimeCalculation;
  lucroPresumido: RegimeCalculation;
  lucroReal: RegimeCalculation;
  recommendedRegime: RegimeType;
  estimatedSavings: number;
  analysisDetails: string;
}

export class TaxCalculationService {
  /**
   * Calculate Simples Nacional tax liability
   * - Unified tax rate (single payment)
   * - Simplified accounting
   * - Limited to R$4.8M annual revenue (2024)
   */
  static calculateSimples(input: TaxInput): RegimeCalculation {
    const sector = input.sector?.toUpperCase() || 'DEFAULT';
    const rate = SIMPLES_RATES[sector] || SIMPLES_RATES['DEFAULT'];

    const taxLiability = Math.round(input.grossRevenue * rate);
    const monthlyPayment = Math.round(taxLiability / 12);

    return {
      taxRate: rate,
      taxLiability,
      monthlyPayment,
      advantages: [
        'Single unified tax (replaces IRPJ, CSLL, IPI, INSS)',
        'Simplified accounting',
        'Lower administrative burden',
        'Fixed monthly payments (DAS)',
        'Eligible companies with revenue < R$4.8M',
      ],
      disadvantages: [
        'Cannot recover VAT credit',
        'Higher effective rate for high-margin businesses',
        'Limited to certain sectors',
        'Cannot offset losses',
      ],
    };
  }

  /**
   * Calculate Lucro Presumido tax liability
   * - Presumed profit margin (fixed % of revenue)
   * - Federal tax only (IRPJ + CSLL)
   * - Quarterly estimated payments
   */
  static calculatePresumido(input: TaxInput): RegimeCalculation {
    const sector = input.sector?.toUpperCase() || 'DEFAULT';
    const presumedMargin = PRESUMED_MARGINS[sector] || PRESUMED_MARGINS['DEFAULT'];

    // Calculate presumed profit
    const presumedProfit = Math.round(input.grossRevenue * presumedMargin);

    // Calculate federal tax
    const monthlyProfit = Math.round(presumedProfit / 12);
    const excess = Math.max(0, monthlyProfit - 20000); // R$20K monthly threshold in centavos

    // IRPJ: 15% base + 10% additional on excess
    const irpj = Math.round(
      (presumedProfit * TAX_RATES.irpj) + (excess * 12 * TAX_RATES.irpjAdditional)
    );

    // CSLL: 9% base + 20% additional on excess
    const csll = Math.round(
      (presumedProfit * TAX_RATES.csll) + (excess * 12 * TAX_RATES.csllAdditional)
    );

    const taxLiability = irpj + csll;
    const monthlyPayment = Math.round(taxLiability / 12);

    return {
      taxRate: (TAX_RATES.irpj + TAX_RATES.csll),
      taxLiability,
      monthlyPayment,
      advantages: [
        'Moderate tax rate (34% federal)',
        'Simple calculation (fixed profit margin)',
        'Quarterly estimated payments',
        'No detailed accounting required',
        'Can be elected by any company',
      ],
      disadvantages: [
        'Presumed profit fixed regardless of actual profit',
        'Cannot recover VAT credit',
        'Fixed margins may not match reality',
        'More tax if actual profit is low',
        'Cannot offset previous losses',
      ],
    };
  }

  /**
   * Calculate Lucro Real tax liability
   * - Based on actual profit
   * - Federal tax (IRPJ + CSLL)
   * - Quarterly estimated payments + annual reconciliation
   */
  static calculateReal(input: TaxInput): RegimeCalculation {
    // Calculate actual taxable profit
    const expenses = input.expenses || 0;
    const deductions = input.deductions || 0;
    const actualProfit = Math.max(0, input.grossRevenue - expenses - deductions);

    const monthlyProfit = Math.round(actualProfit / 12);
    const excess = Math.max(0, monthlyProfit - 20000); // R$20K monthly threshold in centavos

    // IRPJ: 15% base + 10% additional on excess
    const irpj = Math.round(
      (actualProfit * TAX_RATES.irpj) + (excess * 12 * TAX_RATES.irpjAdditional)
    );

    // CSLL: 9% base + 20% additional on excess
    const csll = Math.round(
      (actualProfit * TAX_RATES.csll) + (excess * 12 * TAX_RATES.csllAdditional)
    );

    const taxCredits = input.taxCredits || 0;
    let taxLiability = irpj + csll - taxCredits;
    taxLiability = Math.max(0, taxLiability); // Cannot be negative

    // Subtract payments already made
    const previousPayments = input.previousPayments || 0;
    const remainingBalance = Math.max(0, taxLiability - previousPayments);

    const monthlyPayment = Math.round(remainingBalance / 12);

    return {
      taxRate: (TAX_RATES.irpj + TAX_RATES.csll),
      taxLiability,
      monthlyPayment,
      advantages: [
        'Lower rate if profit is low (34% federal)',
        'Can recover VAT credit',
        'Tax based on actual profit',
        'Can offset losses',
        'Can utilize tax credits',
        'Required for companies > R$78M revenue',
      ],
      disadvantages: [
        'Requires detailed accounting',
        'More complex calculations',
        'Higher tax if profit is high',
        'Quarterly estimated payments required',
        'Annual reconciliation needed',
      ],
    };
  }

  /**
   * Compare all three regimes and recommend the best option
   */
  static compareRegimes(input: TaxInput): TaxComparison {
    const simples = this.calculateSimples(input);
    const presumido = this.calculatePresumido(input);
    const real = this.calculateReal(input);

    // Determine recommended regime (lowest tax liability)
    let recommendedRegime: RegimeType;
    let minTax = simples.taxLiability;

    if (presumido.taxLiability < minTax) {
      recommendedRegime = 'LUCRO_PRESUMIDO';
      minTax = presumido.taxLiability;
    } else {
      recommendedRegime = 'SIMPLES_NACIONAL';
    }

    if (real.taxLiability < minTax) {
      recommendedRegime = 'LUCRO_REAL';
      minTax = real.taxLiability;
    }

    // Calculate estimated savings vs current regime (assume Simples is current)
    const currentRegime = 'SIMPLES_NACIONAL';
    const currentTax = simples.taxLiability;
    const estimatedSavings = Math.max(0, currentTax - minTax);

    return {
      simplasNacional: simples,
      lucroPresumido: presumido,
      lucroReal: real,
      recommendedRegime,
      estimatedSavings,
      analysisDetails: this.generateAnalysisDetails(
        input,
        simples,
        presumido,
        real,
        recommendedRegime
      ),
    };
  }

  /**
   * Generate detailed analysis explanation
   */
  private static generateAnalysisDetails(
    input: TaxInput,
    simples: RegimeCalculation,
    presumido: RegimeCalculation,
    real: RegimeCalculation,
    recommended: RegimeType
  ): string {
    const revenue = (input.grossRevenue / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const lines = [
      'ANÁLISE COMPARATIVA DE REGIMES FISCAIS',
      '====================================',
      '',
      `Receita Bruta Anual: ${revenue}`,
      '',
      'SIMPLES NACIONAL:',
      `  - Alíquota: ${(simples.taxRate * 100).toFixed(2)}%`,
      `  - Imposto Anual: R$ ${(simples.taxLiability / 100).toFixed(2)}`,
      `  - Parcela Mensal: R$ ${(simples.monthlyPayment / 100).toFixed(2)}`,
      '',
      'LUCRO PRESUMIDO:',
      `  - Alíquota Federal: ${(presumido.taxRate * 100).toFixed(2)}%`,
      `  - Imposto Anual: R$ ${(presumido.taxLiability / 100).toFixed(2)}`,
      `  - Parcela Mensal: R$ ${(presumido.monthlyPayment / 100).toFixed(2)}`,
      '',
      'LUCRO REAL:',
      `  - Alíquota Federal: ${(real.taxRate * 100).toFixed(2)}%`,
      `  - Imposto Anual: R$ ${(real.taxLiability / 100).toFixed(2)}`,
      `  - Parcela Mensal: R$ ${(real.monthlyPayment / 100).toFixed(2)}`,
      '',
      'RECOMENDAÇÃO:',
      `  - Regime Recomendado: ${recommended}`,
      `  - Economia Anual: R$ ${(this.estimatedSavings / 100).toFixed(2)} vs Simples Nacional`,
      '',
      'IMPORTANTE:',
      '  - Esta análise é informativa e não constitui consultoria fiscal',
      '  - Consulte um contador para decisão definitiva',
      '  - Considere fatores não-fiscais na decisão',
    ];

    return lines.join('\n');
  }

  /**
   * Format tax calculations to JSON for storage
   */
  static formatForStorage(calculation: RegimeCalculation): Record<string, unknown> {
    return {
      taxRate: calculation.taxRate,
      taxLiability: calculation.taxLiability,
      monthlyPayment: calculation.monthlyPayment,
      advantages: calculation.advantages,
      disadvantages: calculation.disadvantages,
    };
  }
}
