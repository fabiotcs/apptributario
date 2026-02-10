'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdvisory } from '@/hooks/useAdvisory';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function AdvisoryReviewPage() {
  const params = useParams();
  const router = useRouter();
  const advisoryId = params.advisoryId as string;

  const [formData, setFormData] = useState({
    notes: '',
    recommendations: [''],
    reviewStatus: 'APPROVED' as 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { submitReview } = useAdvisory();

  const handleAddRecommendation = () => {
    setFormData({
      ...formData,
      recommendations: [...formData.recommendations, ''],
    });
  };

  const handleRemoveRecommendation = (index: number) => {
    setFormData({
      ...formData,
      recommendations: formData.recommendations.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const filledRecommendations = formData.recommendations.filter((r) => r.trim());

      await submitReview({
        advisoryId,
        notes: formData.notes,
        recommendations: filledRecommendations,
        reviewStatus: formData.reviewStatus,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/accountant/advisory');
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Parecer Enviado!</h2>
            <p className="text-gray-600">Sua análise foi registrada com sucesso.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análise do Parecer</h1>
        <p className="mt-2 text-gray-600">Forneça sua análise e recomendações profissionais</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Review Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status da Análise *
              </label>
              <div className="space-y-2">
                {[
                  { value: 'APPROVED', label: 'Aprovado', color: 'green' },
                  { value: 'NEEDS_REVISION', label: 'Revisão Necessária', color: 'yellow' },
                  { value: 'REJECTED', label: 'Rejeitado', color: 'red' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="reviewStatus"
                      value={option.value}
                      checked={formData.reviewStatus === option.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reviewStatus: e.target.value as typeof formData.reviewStatus,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className="ml-3 font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Analysis Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Análise Detalhada *
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                required
                rows={8}
                placeholder="Descreva sua análise detalhada da situação tributária, considerações e conclusões..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 10 caracteres</p>
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Recomendações (opcional)
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddRecommendation}
                >
                  + Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {formData.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={rec}
                      onChange={(e) => {
                        const newRecs = [...formData.recommendations];
                        newRecs[idx] = e.target.value;
                        setFormData({ ...formData, recommendations: newRecs });
                      }}
                      placeholder="Ex: Considerar mudança para Simples Nacional"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.recommendations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecommendation(idx)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting || !formData.notes}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Enviando...' : 'Enviar Parecer'}
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Dicas para uma boa análise:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Seja específico e objetivo em sua análise</li>
                <li>• Cite exemplos ou cenários quando apropriado</li>
                <li>• Forneça recomendações práticas e implementáveis</li>
                <li>• Considere a situação financeira atual da empresa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
