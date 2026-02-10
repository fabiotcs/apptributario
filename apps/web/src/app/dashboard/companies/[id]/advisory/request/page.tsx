'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdvisory } from '@/hooks/useAdvisory';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function RequestAdvisoryPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [formData, setFormData] = useState({
    analysisId: '',
    requestType: 'TAX_REVIEW' as 'TAX_REVIEW' | 'GENERAL_ADVISORY',
    description: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createAdvisory, isCreating } = useAdvisory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createAdvisory({
        companyId,
        analysisId: formData.analysisId,
        requestType: formData.requestType,
        description: formData.description,
      });

      setSubmitted(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/companies/${companyId}/advisory`);
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Parecer Solicitado!</h2>
            <p className="text-gray-600 mb-4">
              Seu parecer contábil foi solicitado com sucesso. Um contador será atribuído em breve.
            </p>
            <p className="text-sm text-gray-500">Redirecionando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitar Parecer Contábil</h1>
        <p className="mt-2 text-gray-600">Peça um parecer de um contador experiente</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Solicitação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Analysis Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Análise Tributária *
              </label>
              <select
                value={formData.analysisId}
                onChange={(e) => setFormData({ ...formData, analysisId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma análise</option>
                <option value="analysis-1">Análise Tributária 2024 - Anual</option>
                <option value="analysis-2">Análise Tributária 2024 - Q1</option>
              </select>
            </div>

            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Parecer *
              </label>
              <div className="space-y-3">
                {[
                  {
                    value: 'TAX_REVIEW',
                    label: 'Análise Tributária',
                    desc: 'Revisão de regime fiscal e conformidade',
                  },
                  {
                    value: 'GENERAL_ADVISORY',
                    label: 'Parecer Geral',
                    desc: 'Recomendações de negócio e planejamento',
                  },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="requestType"
                      value={option.value}
                      checked={formData.requestType === option.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestType: e.target.value as 'TAX_REVIEW' | 'GENERAL_ADVISORY',
                        })
                      }
                      className="h-4 w-4"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                placeholder="Detalhe sua necessidade ou dúvidas específicas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isCreating || !formData.analysisId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? 'Solicitando...' : 'Solicitar Parecer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <p className="text-gray-700">Você solicita um parecer com detalhes da sua necessidade</p>
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <p className="text-gray-700">Um contador experiente é atribuído ao seu pedido</p>
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <p className="text-gray-700">Você recebe a análise com recomendações e orientações</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
