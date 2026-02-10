'use client';

import { useRouter, useParams } from 'next/navigation';
import { TaxAnalysisForm } from '@/components/tax/TaxAnalysisForm';
import { useTaxAnalyses } from '@/hooks/useTaxAnalyses';
import { toast } from 'sonner';

export default function CreateAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const { createAnalysis, isCreating, error } = useTaxAnalyses();

  const handleSubmit = async (data: any) => {
    try {
      // Convert centavos format (already in reais from form, need to convert to centavos)
      const payload = {
        ...data,
        companyId,
        grossRevenue: BigInt(Math.round(data.grossRevenue * 100)),
        expenses: data.expenses ? BigInt(Math.round(data.expenses * 100)) : undefined,
        deductions: data.deductions ? BigInt(Math.round(data.deductions * 100)) : undefined,
        taxCredits: data.taxCredits ? BigInt(Math.round(data.taxCredits * 100)) : undefined,
        previousPayments: data.previousPayments ? BigInt(Math.round(data.previousPayments * 100)) : undefined,
      };

      await new Promise((resolve, reject) => {
        createAnalysis(payload, {
          onSuccess: () => {
            toast.success('Análise criada com sucesso!');
            router.push(`/dashboard/companies/${companyId}/tax/analyses`);
            resolve(null);
          },
          onError: (err: any) => {
            toast.error(err.message || 'Erro ao criar análise');
            reject(err);
          },
        });
      });
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Análise Fiscal</h1>
        <p className="text-gray-600 mt-2">
          Preencha os dados abaixo para criar uma nova análise fiscalComparação dos 3 regimes tributários
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <TaxAnalysisForm
        companyId={companyId}
        onSubmit={handleSubmit}
        isLoading={isCreating}
      />
    </div>
  );
}
