'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ForecastData {
  quarter: string;
  revenue: number;
  estimatedTax: number;
  recommended: number;
}

interface TaxForecastChartProps {
  title?: string;
  data: ForecastData[];
  currency?: string;
  height?: number;
}

export function TaxForecastChart({
  title = 'Projeção de Impostos',
  data,
  currency = 'R$',
  height = 300,
}: TaxForecastChartProps) {
  const formatCurrency = (value: number) => {
    return `${currency} ${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
              name="Receita Estimada"
            />
            <Line
              type="monotone"
              dataKey="estimatedTax"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444' }}
              name="Imposto Estimado"
            />
            <Line
              type="monotone"
              dataKey="recommended"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#22c55e' }}
              name="Regime Recomendado"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Receita Total</p>
            <p className="text-lg font-bold text-blue-600">
              {(data.reduce((sum, d) => sum + d.revenue, 0) / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Imposto Total</p>
            <p className="text-lg font-bold text-red-600">
              {(data.reduce((sum, d) => sum + d.estimatedTax, 0) / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Taxa Efetiva</p>
            <p className="text-lg font-bold text-green-600">
              {(
                (data.reduce((sum, d) => sum + d.estimatedTax, 0) /
                  data.reduce((sum, d) => sum + d.revenue, 0)) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
