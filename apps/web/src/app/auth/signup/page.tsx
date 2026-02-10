'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/lib/validation';
import { FormField } from '@/components/auth/FormField';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Registration failed');
        return;
      }

      // Redirect to login with success message
      router.push('/auth/login?registered=true');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agente Tributário</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <FormField
              {...register('email')}
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email}
              disabled={isLoading}
            />

            {/* Name Field */}
            <FormField
              {...register('name')}
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name}
              disabled={isLoading}
            />

            {/* Role Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                {...register('role')}
                disabled={isLoading}
                className={`
                  px-3 py-2 border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors
                  ${errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
                `}
              >
                <option value="">Select your role</option>
                <option value="EMPRESARIO">Empresário (Business Owner)</option>
                <option value="CONTADOR">Contador (Accountant)</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && (
                <span className="text-xs text-red-600 font-medium">
                  {errors.role.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <FormField
              {...register('password')}
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              disabled={isLoading}
            />

            {/* Password Strength Indicator */}
            {password && <PasswordStrength password={password} />}

            {/* Confirm Password Field */}
            <FormField
              {...register('confirmPassword')}
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword}
              disabled={isLoading}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                isLoading || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {isLoading || isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-600 mt-4 text-center">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </a>
          </p>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
