'use client';

import { SpecializationLabels, SpecializationColors } from '@/lib/validation/accountant';
import type { Specialization } from '@/lib/validation/accountant';

interface SpecializationTagProps {
  specialization: Specialization;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
}

export function SpecializationTag({
  specialization,
  size = 'md',
  variant = 'solid',
}: SpecializationTagProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const colorClass = SpecializationColors[specialization];
  const label = SpecializationLabels[specialization];

  if (variant === 'outline') {
    const [bgClass, textClass] = colorClass.split(' ');
    const baseColor = bgClass.replace('bg-', '').replace('-100', '');
    return (
      <span className={`rounded-full border-2 border-${baseColor}-300 text-${baseColor}-700 font-medium ${sizeClasses[size]}`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`rounded-full font-medium ${colorClass} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
}
