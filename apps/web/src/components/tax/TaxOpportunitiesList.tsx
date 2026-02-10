'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TaxOpportunity {
  id: string;
  category: string;
  title: string;
  description: string;
  estimatedSavings: number;
  roi: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
  timeline: string;
  priority: number;
  requirements: string[];
}

interface TaxOpportunitiesListProps {
  opportunities: TaxOpportunity[];
  summary: {
    totalOpportunities: number;
    potentialAnnualSavings: number;
    highPriorityCount: number;
    implementableNow: number;
  };
}

function formatCurrency(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    DEDUCTION: 'Dedução',
    CREDIT: 'Crédito',
    TIMING: 'Timing',
    EXPENSE_OPTIMIZATION: 'Otimização',
  };
  return labels[category] || category;
}

function getRiskColor(risk: string): string {
  return {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  }[risk] || 'bg-gray-100 text-gray-800';
}

function getEffortColor(effort: string): string {
  return {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-purple-100 text-purple-800',
    HIGH: 'bg-orange-100 text-orange-800',
  }[effort] || 'bg-gray-100 text-gray-800';
}

function getPriorityColor(priority: number): string {
  if (priority >= 8) return 'border-red-500 bg-red-50';
  if (priority >= 6) return 'border-yellow-500 bg-yellow-50';
  return 'border-blue-500 bg-blue-50';
}

export function TaxOpportunitiesList({
  opportunities,
  summary,
}: TaxOpportunitiesListProps) {
  // Sort by priority (highest first)
  const sorted = [...opportunities].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total de Oportunidades</p>
            <p className="text-3xl font-bold">{summary.totalOpportunities}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Economia Potencial</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.potentialAnnualSavings)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Alta Prioridade</p>
            <p className="text-3xl font-bold text-orange-600">{summary.highPriorityCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Implementável Agora</p>
            <p className="text-3xl font-bold text-blue-600">{summary.implementableNow}</p>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities list */}
      <Card>
        <CardHeader>
          <CardTitle>Oportunidades de Otimização Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sorted.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma oportunidade identificada
              </p>
            ) : (
              sorted.map((opp) => (
                <div
                  key={opp.id}
                  className={`p-4 rounded-lg border-2 ${getPriorityColor(opp.priority)}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{opp.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(opp.estimatedSavings)}
                      </p>
                      <p className="text-xs text-gray-500">/ano</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="outline">
                      {getCategoryLabel(opp.category)}
                    </Badge>
                    <Badge className={getRiskColor(opp.riskLevel)}>
                      Risco: {opp.riskLevel === 'LOW' ? 'Baixo' : opp.riskLevel === 'MEDIUM' ? 'Médio' : 'Alto'}
                    </Badge>
                    <Badge className={getEffortColor(opp.implementationEffort)}>
                      Esforço: {opp.implementationEffort === 'LOW' ? 'Baixo' : opp.implementationEffort === 'MEDIUM' ? 'Médio' : 'Alto'}
                    </Badge>
                    <Badge variant="secondary">
                      ROI: {opp.roi.toFixed(0)}%
                    </Badge>
                    <Badge variant="secondary">
                      Prioridade: {opp.priority}/10
                    </Badge>
                  </div>

                  {/* Timeline and requirements */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Prazo</p>
                      <p className="font-semibold text-gray-900">{opp.timeline}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pré-requisitos</p>
                      <ul className="text-gray-900 space-y-1">
                        {opp.requirements.slice(0, 2).map((req, idx) => (
                          <li key={idx} className="text-xs">
                            • {req}
                          </li>
                        ))}
                        {opp.requirements.length > 2 && (
                          <li className="text-xs text-blue-600">
                            +{opp.requirements.length - 2} mais
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
