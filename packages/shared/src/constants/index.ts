/**
 * Shared Constants for Agente Tritutario
 */

export const TAX_REGIMES = {
  SIMPLES: 'SIMPLES',
  LUCRO_PRESUMIDO: 'LUCRO_PRESUMIDO',
  LUCRO_REAL: 'LUCRO_REAL',
} as const;

export const COMPANY_TYPES = {
  MEI: 'MEI',
  PJ: 'PJ',
  STARTUP: 'STARTUP',
} as const;

export const USER_ROLES = {
  ENTREPRENEUR: 'entrepreneur',
  ACCOUNTANT: 'accountant',
  ADMIN: 'admin',
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const API_ENDPOINTS = {
  HEALTH: '/health',
  API_BASE: '/api',
  AUTH: '/auth',
  USERS: '/users',
  COMPANIES: '/companies',
  ANALYSIS: '/analysis',
} as const;

export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
