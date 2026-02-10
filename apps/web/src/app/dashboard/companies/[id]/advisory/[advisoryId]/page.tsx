'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, User, MessageSquare } from 'lucide-react';

interface AdvisoryDetail {
  id: string;
  status: 'PENDING' | 'ASSIGNED' | 'REVIEWED' | 'CANCELLED';
  requestType: 'TAX_REVIEW' | 'GENERAL_ADVISORY';
  createdAt: string;
  assignedAt?: string;
  reviewedAt?: string;
  assignedAccountant?: {
    user: { name: string; email: string };
  };
  reviewNotes?: string;
  reviewRecommendations?: string[];
  reviewStatus?: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
}

export default function AdvisoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const advisoryId = params.advisoryId as string;

  const [advisory, setAdvisory] = useState<AdvisoryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        const response = await fetch(`/api/v1/advisory/${advisoryId}`);
        if (response.ok) {
          const data = await response.json();
          setAdvisory(data);
        }
      } catch (error) {
        console.error('Failed to fetch advisory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisory();
  }, [advisoryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Carregando parecer...</div>
      </div>
    );
  }

  if (!advisory) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Parecer não encontrado</h2>
        <Button className="mt-4" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'ASSIGNED':
        return <User className="h-5 w-5 text-blue-600" />;
      case 'REVIEWED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Aguardando atribuição',
      ASSIGNED: 'Em análise',
      REVIEWED: 'Análise concluída',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Parecer</h1>
          <p className="mt-2 text-gray-600">
            {advisory.requestType === 'TAX_REVIEW' ? 'Análise Tributária' : 'Parecer Geral'}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          ← Voltar
        </Button>
      </div>

      {/* Status Card */}
      <Card className="border-l-4 border-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(advisory.status)}
              <div>
                <h3 className="font-semibold text-gray-900">{getStatusLabel(advisory.status)}</h3>
                <p className="text-sm text-gray-600">
                  Solicitado em {new Date(advisory.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <Badge
              variant={
                advisory.status === 'REVIEWED'
                  ? 'default'
                  : advisory.status === 'ASSIGNED'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {getStatusLabel(advisory.status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Accountant Info */}
        {advisory.assignedAccountant && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contador Atribuído
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-gray-900">{advisory.assignedAccountant.user.name}</p>
              <p className="text-sm text-gray-600">{advisory.assignedAccountant.user.email}</p>
              <p className="text-xs text-gray-500">
                Atribuído em{' '}
                {advisory.assignedAt
                  ? new Date(advisory.assignedAt).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Cronograma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Solicitado</p>
                <p className="text-xs text-gray-600">
                  {new Date(advisory.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            {advisory.assignedAt && (
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Atribuído</p>
                  <p className="text-xs text-gray-600">
                    {new Date(advisory.assignedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
            {advisory.reviewedAt && (
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Análise Concluída</p>
                  <p className="text-xs text-gray-600">
                    {new Date(advisory.reviewedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Content */}
      {advisory.status === 'REVIEWED' && advisory.reviewNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Parecer do Contador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Status da Análise</h4>
              <Badge
                variant={
                  advisory.reviewStatus === 'APPROVED'
                    ? 'default'
                    : advisory.reviewStatus === 'NEEDS_REVISION'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {advisory.reviewStatus === 'APPROVED'
                  ? 'Aprovado'
                  : advisory.reviewStatus === 'NEEDS_REVISION'
                    ? 'Revisão Necessária'
                    : 'Rejeitado'}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Análise</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{advisory.reviewNotes}</p>
            </div>

            {advisory.reviewRecommendations && advisory.reviewRecommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Recomendações</h4>
                <ul className="space-y-2">
                  {advisory.reviewRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Review Yet */}
      {advisory.status !== 'REVIEWED' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Análise em progresso</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {advisory.status === 'PENDING'
                    ? 'Seu parecer está aguardando atribuição. Um contador será designado em breve.'
                    : 'Um contador está analisando sua solicitação. Você será notificado quando a análise estiver concluída.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
