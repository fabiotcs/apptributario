'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTaxAnalyses } from '@/hooks/useTaxAnalyses';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatCurrency(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'REVIEWED':
      return 'bg-green-100 text-green-800';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Rascunho',
    COMPLETED: 'Concluída',
    REVIEWED: 'Revisada',
    ARCHIVED: 'Arquivada',
  };
  return labels[status] || status;
}

export default function TaxAnalysesPage() {
  const params = useParams();
  const companyId = params.id as string;
  const [page, setPage] = useState(1);

  const { analyses, isLoading, pagination } = useTaxAnalyses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Análises Fiscais</h1>
        <Link href={`/dashboard/companies/${companyId}/tax/analyses/create`}>
          <Button>+ Nova Análise</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Análises</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando análises...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhuma análise criada ainda</p>
              <Link href={`/dashboard/companies/${companyId}/tax/analyses/create`}>
                <Button>Criar Primeira Análise</Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ano</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Regime Recomendado</TableHead>
                    <TableHead>Economia Potencial</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell className="font-medium">{analysis.year}</TableCell>
                      <TableCell>
                        {analysis.analysisType === 'QUARTERLY'
                          ? 'Trimestral'
                          : analysis.analysisType === 'ANNUAL'
                            ? 'Anual'
                            : 'Personalizado'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(analysis.status)}>
                          {getStatusLabel(analysis.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {analysis.comparison?.recommendedRegime === 'SIMPLES_NACIONAL'
                          ? 'Simples Nacional'
                          : analysis.comparison?.recommendedRegime === 'LUCRO_PRESUMIDO'
                            ? 'Lucro Presumido'
                            : 'Lucro Real'}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {formatCurrency(analysis.comparison?.estimatedSavings || 0)}
                      </TableCell>
                      <TableCell>{formatDate(analysis.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/tax/analyses/${analysis.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {page} de {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
