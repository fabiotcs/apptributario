'use client';

import { useParams } from 'next/navigation';
import { useTaxAnalyses } from '@/hooks/useTaxAnalyses';
import { TaxComparisonTable } from '@/components/tax/TaxComparisonTable';
import { TaxOpportunitiesList } from '@/components/tax/TaxOpportunitiesList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const analysisId = params.id as string;

  const { getAnalysis, getComparison, getOpportunities } = useTaxAnalyses();

  const analysisQuery = getAnalysis(analysisId);
  const comparisonQuery = getComparison(analysisId);
  const opportunitiesQuery = getOpportunities(analysisId);

  const isLoading = analysisQuery.isLoading || comparisonQuery.isLoading;
  const analysis = analysisQuery.data?.analysis;
  const comparison = comparisonQuery.data?.comparison;
  const opportunities = opportunitiesQuery.data?.opportunities || [];
  const summary = opportunitiesQuery.data?.summary;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!analysis || !comparison) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Análise não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Análise Fiscal {analysis.year}
          </h1>
          <Badge
            className={
              analysis.status === 'REVIEWED'
                ? 'bg-green-100 text-green-800'
                : analysis.status === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
            }
          >
            {analysis.status === 'REVIEWED'
              ? 'Revisada'
              : analysis.status === 'COMPLETED'
                ? 'Concluída'
                : 'Rascunho'}
          </Badge>
        </div>
        <div className="text-gray-600">
          <p>Criada em {formatDate(analysis.createdAt)}</p>
          {analysis.notes && <p className="mt-2 italic">Notas: {analysis.notes}</p>}
        </div>
      </div>

      {/* Input Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Dados Utilizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Receita Bruta Anual</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(analysis.taxData?.grossRevenue || 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(analysis.taxData?.expenses || 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deduções</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(analysis.taxData?.deductions || 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Créditos Fiscais</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(analysis.taxData?.taxCredits || 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regime Comparison */}
      {comparison && (
        <TaxComparisonTable
          regimes={comparison.regimes}
          recommended={comparison.recommended.regime}
          estimatedSavings={comparison.recommended.estimatedAnnualSavings}
        />
      )}

      {/* Tax Opportunities */}
      {summary && opportunities.length > 0 && (
        <TaxOpportunitiesList
          opportunities={opportunities}
          summary={summary}
        />
      )}

      {/* No opportunities message */}
      {summary && opportunities.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-8">
              Nenhuma oportunidade de otimização identificada neste momento
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Details */}
      {analysis.analysisDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Análise Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
              {analysis.analysisDetails}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
