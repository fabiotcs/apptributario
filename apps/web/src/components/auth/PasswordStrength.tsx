'use client';

import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;

    if (score < 2) return { score: 0, label: 'Weak', color: 'bg-red-500' };
    if (score < 3) return { score: 1, label: 'Fair', color: 'bg-yellow-500' };
    if (score < 4) return { score: 2, label: 'Good', color: 'bg-blue-500' };
    return { score: 3, label: 'Strong', color: 'bg-green-500' };
  };

  if (!password) return null;

  const strength = calculateStrength(password);
  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { text: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { text: 'Number (0-9)', met: /\d/.test(password) },
    { text: 'Special character (!@#$%...)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  return (
    <div className="space-y-2">
      {/* Strength meter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-200`}
            style={{ width: `${(strength.score + 1) * 25}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600">
          {strength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="bg-gray-50 rounded p-2 space-y-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className={`w-4 h-4 rounded flex items-center justify-center ${
              req.met ? 'bg-green-100' : 'bg-gray-200'
            }`}>
              {req.met && <span className="text-green-600">✓</span>}
            </span>
            <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
