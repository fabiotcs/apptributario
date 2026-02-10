/**
 * Shared Types for Agente Tritutario
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'entrepreneur' | 'accountant' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  cnpj: string;
  name: string;
  taxRegime: 'SIMPLES' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';
  revenue: number;
  employees: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisResult {
  id: string;
  companyId: string;
  currentRegime: string;
  recommendedRegime: string;
  potentialSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}
