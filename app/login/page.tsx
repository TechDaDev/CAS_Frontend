'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/api';

function getLoginErrorMessage(error: ApiError): string {
  const detail = typeof error.data === 'object' && error.data !== null && 'detail' in error.data
    ? (error.data as { detail?: string }).detail
    : undefined;

  if (detail && !/<[a-z][\s\S]*>/i.test(detail) && !detail.startsWith('<!doctype')) {
    return detail;
  }

  if (error.status === 404) {
    return 'تعذر الوصول إلى خدمة تسجيل الدخول. تحقق من إعدادات الاتصال بالخادم.';
  }

  if (error.status === 0) {
    return 'تعذر الاتصال بالخادم. تحقق من الشبكة ثم حاول مرة أخرى.';
  }

  return 'بيانات الاعتماد غير صالحة. يرجى المحاولة مرة أخرى.';
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userData = await login(email, password);
      const redirect = searchParams.get('redirect');
      const destination = redirect || (userData.is_superuser ? '/platform' : '/dashboard');
      router.replace(destination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getLoginErrorMessage(err));
      } else {
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-600">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          
          <h2 className="mt-6 text-center text-2xl font-semibold text-slate-900">
            تسجيل الدخول إلى نظام ادارة المعاملات الادارية
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            نظام سير العمل الإداري للكلية
          </p>

          {error && (
            <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-center text-xs text-slate-500">
              استخدم بيانات اعتمادك المؤسسية للوصول إلى النظام.
              تواصل مع المسؤول إذا كنت بحاجة إلى مساعدة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-500">جارٍ تحميل صفحة الدخول...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
