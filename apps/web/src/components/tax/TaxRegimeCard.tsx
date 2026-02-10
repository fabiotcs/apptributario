'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/validation/tax';

interface RegimeCardProps {
  name: string;
  taxLiability: number;
  monthlyPayment: number;
  taxRate: number;
  advantages: string[];
  disadvantages: string[];
  recommended?: boolean;
  eligible?: boolean;
  eligibilityNotes?: string;
}

export function TaxRegimeCard({
  name,
  taxLiability,
  monthlyPayment,
  taxRate,
  advantages,
  disadvantages,
  recommended = false,
  eligible = true,
  eligibilityNotes,
}: RegimeCardProps) {
  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        recommended ? 'border-2 border-green-500 shadow-lg' : 'border border-gray-200'
      } ${!eligible ? 'opacity-60' : ''}`}
    >
      {recommended && (
        <div className="absolute right-0 top-0 bg-green-500 px-3 py-1 text-sm font-bold text-white">
          Recomendado
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{name}</CardTitle>
        {!eligible && eligibilityNotes && (
          <p className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {eligibilityNotes}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Taxa</p>
            <p className="text-lg font-bold">{(taxRate * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Mensal</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(monthlyPayment)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-medium text-gray-500 uppercase">Imposto Anual</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(taxLiability)}</p>
          </div>
        </div>

        {/* Advantages */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Check className="h-4 w-4 text-green-600" />
            Vantagens
          </h4>
          <ul className="space-y-1">
            {advantages.map((advantage, idx) => (
              <li key={idx} className="text-sm text-gray-600">
                • {advantage}
              </li>
            ))}
          </ul>
        </div>

        {/* Disadvantages */}
        {disadvantages.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <X className="h-4 w-4 text-red-600" />
              Desvantagens
            </h4>
            <ul className="space-y-1">
              {disadvantages.map((disadvantage, idx) => (
                <li key={idx} className="text-sm text-gray-600">
                  • {disadvantage}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
