import { formatBRL, formatCNPJ, formatDate, formatPercent } from '../src/utils/formatters';

describe('formatters', () => {
  describe('formatBRL', () => {
    it('should format number as BRL currency', () => {
      const result = formatBRL(1000);
      expect(result).toContain('R$');
      expect(result).toContain('1.000');
    });

    it('should handle decimal values', () => {
      const result = formatBRL(1234.56);
      expect(result).toContain('1.234,56');
    });
  });

  describe('formatCNPJ', () => {
    it('should format CNPJ correctly', () => {
      const cnpj = '12345678000195';
      const result = formatCNPJ(cnpj);
      expect(result).toBe('12.345.678/0001-95');
    });

    it('should handle already formatted CNPJ', () => {
      const cnpj = '12.345.678/0001-95';
      const result = formatCNPJ(cnpj);
      expect(result).toBe('12.345.678/0001-95');
    });

    it('should return original string if invalid length', () => {
      const cnpj = '123';
      const result = formatCNPJ(cnpj);
      expect(result).toBe('123');
    });
  });

  describe('formatDate', () => {
    it('should format date in pt-BR locale', () => {
      const date = new Date('2026-02-09');
      const result = formatDate(date);
      expect(result).toContain('9');
      expect(result).toContain('2026');
    });
  });

  describe('formatPercent', () => {
    it('should format percent with default 2 decimals', () => {
      const result = formatPercent(25.5);
      expect(result).toBe('25.50%');
    });

    it('should respect custom decimal places', () => {
      const result = formatPercent(25.5, 0);
      expect(result).toBe('26%');
    });
  });
});
