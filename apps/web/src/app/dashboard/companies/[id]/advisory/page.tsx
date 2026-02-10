'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdvisory } from '@/hooks/useAdvisory';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdvisoryPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { list: advisories, isLoading, createAdvisory } = useAdvisory();
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned' | 'reviewed'>('all');

  const filteredAdvisories = advisories.filter((a) => {
    if (filter === 'all') return true;
    return a.status.toLowerCase() === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'ASSIGNED':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'REVIEWED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Aguardando',
      ASSIGNED: 'Em análise',
      REVIEWED: 'Analisado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pareceres Contábeis</h1>
          <p className="mt-2 text-gray-600">Solicitar e acompanhar análises contábeis</p>
        </div>
        <Link href={`/dashboard/companies/${companyId}/advisory/request`}>
          <Button className="bg-blue-600 hover:bg-blue-700">+ Solicitar Parecer</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {advisories?.filter((a) => a.status === 'PENDING').length || 0}
              </div>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {advisories?.filter((a) => a.status === 'ASSIGNED').length || 0}
              </div>
              <p className="text-sm text-gray-600">Em Análise</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {advisories?.filter((a) => a.status === 'REVIEWED').length || 0}
              </div>
              <p className="text-sm text-gray-600">Analisados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'assigned', 'reviewed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'assigned' ? 'Em Análise' : 'Analisados'}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Carregando pareceres...</div>
        ) : filteredAdvisories?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Nenhum parecer encontrado
            </CardContent>
          </Card>
        ) : (
          filteredAdvisories?.map((advisory) => (
            <Card key={advisory.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(advisory.status)}
                      <h3 className="text-lg font-semibold">
                        {advisory.requestType === 'TAX_REVIEW'
                          ? 'Análise Tributária'
                          : 'Parecer Geral'}
                      </h3>
                      <Badge variant="outline">{getStatusLabel(advisory.status)}</Badge>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Solicitado em: {new Date(advisory.createdAt).toLocaleDateString('pt-BR')}</p>
                      {advisory.assignedAccountant && (
                        <p>Contador: {advisory.assignedAccountant.user?.name}</p>
                      )}
                      {advisory.reviewedAt && (
                        <p>Analisado em: {new Date(advisory.reviewedAt).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>

                  <Link href={`/dashboard/companies/${companyId}/advisory/${advisory.id}`}>
                    <Button variant="outline">Ver Detalhes</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
