'use client';

import { Building2, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  cnpj: string;
}

interface AssignmentCardProps {
  accountantId: string;
  company: Company;
  role: 'ADVISOR' | 'MANAGER';
  notes?: string;
  assignedAt: string;
  assignedBy: string;
  onRemove?: (accountantId: string, companyId: string) => void;
  onUpdateRole?: (accountantId: string, companyId: string, newRole: 'ADVISOR' | 'MANAGER') => void;
  isLoading?: boolean;
}

export function AssignmentCard({
  accountantId,
  company,
  role,
  notes,
  assignedAt,
  assignedBy,
  onRemove,
  onUpdateRole,
  isLoading = false,
}: AssignmentCardProps) {
  const assignedDate = new Date(assignedAt).toLocaleDateString('pt-BR');
  const roleColor = role === 'MANAGER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';

  const handleRemove = () => {
    if (onRemove && confirm(`Remove ${company.name} assignment?`)) {
      onRemove(accountantId, company.id);
    }
  };

  const toggleRole = () => {
    if (onUpdateRole) {
      const newRole = role === 'MANAGER' ? 'ADVISOR' : 'MANAGER';
      onUpdateRole(accountantId, company.id, newRole);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 flex items-start gap-3">
          <div className="mt-1">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/dashboard/companies/${company.id}`}>
                <h4 className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                  {company.name}
                </h4>
              </Link>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColor}`}>
                {role === 'MANAGER' ? 'Manager' : 'Advisor'}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-mono mb-2">{company.cnpj}</p>
            {notes && (
              <p className="text-sm text-gray-600 italic mb-2">"{notes}"</p>
            )}
            <p className="text-xs text-gray-400">Assigned {assignedDate}</p>
          </div>
        </div>

        {(onRemove || onUpdateRole) && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {onUpdateRole && (
              <button
                onClick={toggleRole}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Change role to ${role === 'MANAGER' ? 'ADVISOR' : 'MANAGER'}`}
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={handleRemove}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove assignment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
