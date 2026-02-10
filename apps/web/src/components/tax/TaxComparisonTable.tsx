'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RegimeData {
  name: string;
  taxRate: number;
  taxLiability: number;
  monthlyPayment: number;
  advantages: string[];
  disadvantages: string[];
}

interface TaxComparisonTableProps {
  regimes: RegimeData[];
  recommended: string;
  estimatedSavings: number;
}

function formatCurrency(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function TaxComparisonTable({
  regimes,
  recommended,
  estimatedSavings,
}: TaxComparisonTableProps) {
  return (
    <div className="space-y-6">
      {/* Main comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Comparação de Regimes Tributários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {regimes.map((regime) => (
              <div
                key={regime.name}
                className={`p-6 rounded-lg border-2 transition-all ${
                  regime.name === recommended
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">
                    {regime.name === 'SIMPLES_NACIONAL'
                      ? 'Simples Nacional'
                      : regime.name === 'LUCRO_PRESUMIDO'
                        ? 'Lucro Presumido'
                        : 'Lucro Real'}
                  </h3>
                  {regime.name === recommended && (
                    <Badge className="bg-green-500">Recomendado</Badge>
                  )}
                </div>

                {/* Tax rate */}
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm text-gray-600 mb-1">Alíquota</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(regime.taxRate * 100).toFixed(2)}%
                  </p>
                </div>

                {/* Tax amounts */}
                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Imposto Anual</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(regime.taxLiability)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parcela Mensal</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(regime.monthlyPayment)}
                    </p>
                  </div>
                </div>

                {/* Advantages */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm text-green-700 mb-2">Vantagens</h4>
                  <ul className="text-sm space-y-1">
                    {regime.advantages.slice(0, 3).map((adv, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disadvantages */}
                <div>
                  <h4 className="font-semibold text-sm text-red-700 mb-2">Desvantagens</h4>
                  <ul className="text-sm space-y-1">
                    {regime.disadvantages.slice(0, 2).map((dis, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>{dis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Savings summary */}
      {estimatedSavings > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Economia Anual Estimada</p>
              <p className="text-4xl font-bold text-green-600">
                {formatCurrency(estimatedSavings)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                comparado ao regime atual (Simples Nacional)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
