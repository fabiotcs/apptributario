'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Validation schema
const taxAnalysisSchema = z.object({
  companyId: z.string().uuid('Selecione uma empresa válida'),
  year: z.coerce.number().int().min(2000).max(2050),
  analysisType: z.enum(['QUARTERLY', 'ANNUAL', 'CUSTOM']),
  sector: z.enum([
    'COMÉRCIO',
    'INDÚSTRIA',
    'SERVIÇO',
    'TRANSPORTES',
    'INTERMEDIAÇÃO',
  ]),
  grossRevenue: z.coerce.number().min(1, 'Receita deve ser maior que 0'),
  expenses: z.coerce.number().min(0).optional(),
  deductions: z.coerce.number().min(0).optional(),
  taxCredits: z.coerce.number().min(0).optional(),
  previousPayments: z.coerce.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

type TaxAnalysisFormData = z.infer<typeof taxAnalysisSchema>;

interface TaxAnalysisFormProps {
  companyId: string;
  onSubmit: (data: TaxAnalysisFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TaxAnalysisForm({
  companyId,
  onSubmit,
  isLoading,
}: TaxAnalysisFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [preview, setPreview] = useState<Partial<TaxAnalysisFormData> | null>(null);

  const form = useForm<TaxAnalysisFormData>({
    resolver: zodResolver(taxAnalysisSchema),
    defaultValues: {
      companyId,
      year: new Date().getFullYear(),
      analysisType: 'ANNUAL',
      sector: 'SERVIÇO',
      grossRevenue: undefined,
      expenses: 0,
      deductions: 0,
      taxCredits: 0,
      previousPayments: 0,
      notes: '',
    },
  });

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setPreview(form.getValues());
      setStep((s) => (s < 3 ? (s + 1) as 1 | 2 | 3 : s));
    }
  };

  const handleBack = () => {
    setStep((s) => (s > 1 ? (s - 1) as 1 | 2 | 3 : s));
  };

  const handleSubmit = async (data: TaxAnalysisFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      setStep(1);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  function formatCurrency(value: number): string {
    return (value / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {step === 1 && 'Passo 1: Tipo de Análise e Período'}
          {step === 2 && 'Passo 2: Dados Financeiros'}
          {step === 3 && 'Passo 3: Revisão e Confirmação'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step 1: Analysis Type */}
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="analysisType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Análise</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                          <SelectItem value="ANNUAL">Anual</SelectItem>
                          <SelectItem value="CUSTOM">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Escolha se a análise é para um trimestre, ano completo ou período customizado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano Fiscal</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="2024" />
                      </FormControl>
                      <FormDescription>
                        Ano ao qual a análise se refere
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor da Empresa</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um setor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="COMÉRCIO">Comércio</SelectItem>
                          <SelectItem value="INDÚSTRIA">Indústria</SelectItem>
                          <SelectItem value="SERVIÇO">Serviço</SelectItem>
                          <SelectItem value="TRANSPORTES">Transportes</SelectItem>
                          <SelectItem value="INTERMEDIAÇÃO">Intermediação</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Setor de atuação principal da empresa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Step 2: Financial Data */}
            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="grossRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receita Bruta Anual *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          step="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Receita bruta anual em reais (ex: 2500000 para R$ 2.5M)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Despesas Dedutiveis Anuais</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          step="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Despesas operacionais e administrativas dedutíveis
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deduções Fiscais</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          step="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Deduções adicionais (ex: contribuições, doações)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Créditos Fiscais Disponíveis</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          step="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Créditos fiscais (ex: ICMS, PIS/COFINS)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previousPayments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pagamentos Estimados Realizados</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          step="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Valor já pago em estimativas durante o ano
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Step 3: Review */}
            {step === 3 && preview && (
              <>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Tipo de Análise</p>
                    <p className="text-lg">
                      {preview.analysisType === 'QUARTERLY'
                        ? 'Trimestral'
                        : preview.analysisType === 'ANNUAL'
                          ? 'Anual'
                          : 'Personalizado'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600">Ano Fiscal</p>
                    <p className="text-lg">{preview.year}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600">Setor</p>
                    <p className="text-lg">{preview.sector}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-600">Dados Financeiros</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Receita Bruta</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency((preview.grossRevenue || 0) * 100)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Despesas</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency((preview.expenses || 0) * 100)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Deduções</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency((preview.deductions || 0) * 100)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Créditos</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency((preview.taxCredits || 0) * 100)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Adicione notas sobre a análise..."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isLoading}
              >
                Voltar
              </Button>

              <div className="space-x-2">
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando...' : 'Criar Análise'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
