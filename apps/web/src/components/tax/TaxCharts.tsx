'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaxChartData {
  year: number;
  simples: number;
  presumido: number;
  real: number;
  regime: string;
  savings?: number;
}

interface TaxChartsProps {
  data: TaxChartData[];
  title?: string;
}

const COLORS = {
  simples: '#10b981',
  presumido: '#3b82f6',
  real: '#f59e0b',
  savings: '#8b5cf6',
};

export function TaxCharts({ data, title = 'Análise Histórica' }: TaxChartsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">Sem dados históricos disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate average taxes by regime
  const avgByRegime = {
    simples: data.reduce((sum, d) => sum + d.simples, 0) / data.length,
    presumido: data.reduce((sum, d) => sum + d.presumido, 0) / data.length,
    real: data.reduce((sum, d) => sum + d.real, 0) / data.length,
  };

  const pieData = [
    { name: 'Simples Nacional', value: avgByRegime.simples },
    { name: 'Lucro Presumido', value: avgByRegime.presumido },
    { name: 'Lucro Real', value: avgByRegime.real },
  ];

  const totalSavings = data.reduce((sum, d) => sum + (d.savings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Line Chart - Tax Comparison Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Impostos ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value) => `R$ ${(Number(value) / 100).toLocaleString('pt-BR')}`}
                labelFormatter={(label) => `Ano: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="simples"
                stroke={COLORS.simples}
                name="Simples Nacional"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="presumido"
                stroke={COLORS.presumido}
                name="Lucro Presumido"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="real"
                stroke={COLORS.real}
                name="Lucro Real"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart - Annual Tax by Regime */}
      <Card>
        <CardHeader>
          <CardTitle>Imposto Anual por Regime</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value) => `R$ ${(Number(value) / 100).toLocaleString('pt-BR')}`}
                labelFormatter={(label) => `Ano: ${label}`}
              />
              <Legend />
              <Bar dataKey="simples" fill={COLORS.simples} name="Simples Nacional" />
              <Bar dataKey="presumido" fill={COLORS.presumido} name="Lucro Presumido" />
              <Bar dataKey="real" fill={COLORS.real} name="Lucro Real" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Average Tax Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Impostos (Média)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: R$ ${(Number(value) / 100).toLocaleString('pt-BR')}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={COLORS.simples} />
                  <Cell fill={COLORS.presumido} />
                  <Cell fill={COLORS.real} />
                </Pie>
                <Tooltip
                  formatter={(value) => `R$ ${(Number(value) / 100).toLocaleString('pt-BR')}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Estatístico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Imposto Médio Anual</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {(Math.min(avgByRegime.simples, avgByRegime.presumido, avgByRegime.real) / 100).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">Regime mais econômico</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Economia Potencial Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(totalSavings / 100).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">Período completo</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Economia Média Anual</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(totalSavings / (data.length * 100)).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">Por ano</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
