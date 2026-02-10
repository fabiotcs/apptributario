'use client';

import { Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Certification {
  name: string;
  issuer: string;
  expiryDate: string;
}

interface CertificationListProps {
  certifications: Certification[];
  showStatus?: boolean;
}

export function CertificationList({ certifications, showStatus = true }: CertificationListProps) {
  if (!certifications || certifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 px-4 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-sm">No certifications added yet</p>
      </div>
    );
  }

  const getCertificationStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle };
    } else if (daysUntilExpiry < 30) {
      return { status: 'expiring', label: `Expires in ${daysUntilExpiry} days`, color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertTriangle };
    } else {
      return { status: 'active', label: `Expires ${expiryDate}`, color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle2 };
    }
  };

  return (
    <div className="space-y-3">
      {certifications.map((cert, idx) => {
        const statusInfo = showStatus ? getCertificationStatus(cert.expiryDate) : null;
        const Icon = statusInfo?.icon || Award;

        return (
          <div key={idx} className={`p-4 rounded-lg border border-gray-200 ${statusInfo?.bgColor || 'bg-white'}`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{cert.name}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{cert.issuer}</p>
              </div>
              {statusInfo && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Icon className={`h-4 w-4 ${statusInfo.color}`} />
                  <span className={`text-xs font-medium ${statusInfo.color} whitespace-nowrap`}>
                    {statusInfo.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
