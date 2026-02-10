'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilingStatusBadge } from '@/components/tax/FilingStatusBadge';
import { getFilingTypeLabel, formatCurrency } from '@/lib/validation/tax';
import { Check, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface TaxFiling {
  id: string;
  filingType: string;
  quarter?: number;
  year: number;
  dueDate: string;
  status: 'PENDING' | 'FILED' | 'OVERDUE' | 'EXEMPT';
  filedDate?: string;
  notes?: string;
}

export default function TaxFilingsPage() {
  const params = useParams();
  const companyId = params.id as string;
  const [filings, setFilings] = useState<TaxFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'filed' | 'overdue'>('all');

  useEffect(() => {
    const loadFilings = async () => {
      try {
        const response = await fetch(`/api/v1/tax/filings?companyId=${companyId}`);
        if (response.ok) {
          const data = await response.json();
          setFilings(data.filings || []);
        }
      } catch (error) {
        console.error('Failed to load filings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilings();
  }, [companyId]);

  const filteredFilings = filings.filter((filing) => {
    if (filter === 'all') return true;
    return filing.status.toLowerCase() === filter;
  });

  const stats = {
    pending: filings.filter((f) => f.status === 'PENDING').length,
    filed: filings.filter((f) => f.status === 'FILED').length,
    overdue: filings.filter((f) => f.status === 'OVERDUE').length,
  };

  const handleMarkFiled = async (filingId: string) => {
    try {
      const response = await fetch(`/api/v1/tax/filings/${filingId}/mark-filed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filedDate: new Date().toISOString() }),
      });

      if (response.ok) {
        setFilings(filings.map((f) => (f.id === filingId ? { ...f, status: 'FILED' as const } : f)));
      }
    } catch (error) {
      console.error('Failed to mark filing:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Carregando declarações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Declarações Tributárias</h1>
          <p className="mt-2 text-gray-600">Gerenciar prazos e status de declarações</p>
        </div>
        <Link href={`/dashboard/companies/${companyId}`}>
          <Button variant="outline">← Voltar</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.filed}</div>
              <p className="text-sm text-gray-600">Enviadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-sm text-gray-600">Atrasadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'filed', 'overdue'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : f === 'filed' ? 'Enviadas' : 'Atrasadas'}
          </Button>
        ))}
      </div>

      {/* Filings List */}
      <div className="space-y-4">
        {filteredFilings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Nenhuma declaração encontrada
            </CardContent>
          </Card>
        ) : (
          filteredFilings.map((filing) => (
            <Card key={filing.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{getFilingTypeLabel(filing.filingType)}</h3>
                      <FilingStatusBadge status={filing.status} />
                      {filing.status === 'OVERDUE' && (
                        <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                          <AlertCircle className="h-4 w-4" />
                          Atrasada
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {filing.quarter ? `Q${filing.quarter}` : 'Anual'} {filing.year}
                        </span>
                      </div>
                      <div>Vencimento: {new Date(filing.dueDate).toLocaleDateString('pt-BR')}</div>
                      {filing.filedDate && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          Enviada em {new Date(filing.filedDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {filing.notes && <p className="mt-2 text-sm text-gray-600 italic">{filing.notes}</p>}
                  </div>

                  <div className="flex gap-2">
                    {filing.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkFiled(filing.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Marcar Enviada
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
