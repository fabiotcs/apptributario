'use client';

import { Badge } from '@/components/ui/badge';

interface FilingStatusBadgeProps {
  status: 'PENDING' | 'FILED' | 'OVERDUE' | 'EXEMPT';
  daysUntilDue?: number;
  isOverdue?: boolean;
}

export function FilingStatusBadge({
  status,
  daysUntilDue,
  isOverdue,
}: FilingStatusBadgeProps) {
  const getStatusColor = () => {
    if (isOverdue) return 'bg-red-100 text-red-800';

    switch (status) {
      case 'FILED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        if (daysUntilDue !== undefined && daysUntilDue <= 7) {
          return 'bg-yellow-100 text-yellow-800';
        }
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'EXEMPT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'FILED':
        return 'Arquivado';
      case 'PENDING':
        return 'Pendente';
      case 'OVERDUE':
        return 'Vencido';
      case 'EXEMPT':
        return 'Isento';
      default:
        return status;
    }
  };

  const getStatusHint = () => {
    if (isOverdue) {
      return 'Vencido - Ação imediata necessária';
    }

    if (status === 'PENDING' && daysUntilDue !== undefined) {
      if (daysUntilDue <= 0) {
        return 'Vence hoje';
      } else if (daysUntilDue === 1) {
        return 'Vence amanhã';
      } else if (daysUntilDue <= 7) {
        return `Vence em ${daysUntilDue} dias`;
      } else {
        return `Vence em ${Math.ceil(daysUntilDue / 7)} semanas`;
      }
    }

    return getStatusLabel();
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge className={getStatusColor()}>
        {getStatusLabel()}
      </Badge>
      <p className="text-xs text-gray-600">{getStatusHint()}</p>
    </div>
  );
}
