'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { institutionsService } from '@/services/institutions';
import { Institution } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import Link from 'next/link';

export default function PlatformDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user?.is_superuser) {
      router.push('/dashboard');
      return;
    }

    const loadInstitutions = async () => {
      try {
        const response = await institutionsService.listInstitutions();
        setInstitutions(response.results.slice(0, 5)); // Show recent 5
      } catch (err) {
        setError('فشل تحميل بيانات المؤسسات');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.is_superuser) {
      loadInstitutions();
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return <LoadingState message="جارٍ تحميل لوحة إدارة المنصة..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">لوحة إدارة المنصة</h1>
        <Link
          href="/platform/institutions"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إدارة المؤسسات
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-50 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-slate-500">إجمالي المؤسسات</p>
              <p className="text-2xl font-bold text-slate-900">{institutions.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-emerald-50 p-3">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-slate-500">المؤسسات النشطة</p>
              <p className="text-2xl font-bold text-slate-900">
                {institutions.filter(i => i.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-amber-50 p-3">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-slate-500">بلا عمداء</p>
              <p className="text-2xl font-bold text-slate-900">
                {institutions.filter(i => !i.dean).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Institutions */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">المؤسسات الحديثة</h2>
        </div>
        {institutions.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-slate-500">لا توجد مؤسسات بعد. قم بإنشاء مؤسستك الأولى.</p>
            <Link
              href="/platform/institutions"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              إنشاء مؤسسة
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {institutions.map((institution) => (
              <div key={institution.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <h3 className="font-medium text-slate-900">{institution.name}</h3>
                  <p className="text-sm text-slate-500">{institution.code} • {institution.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${institution.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {institution.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                  {institution.dean ? (
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      عميد معيّن
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
                      بلا عميد
                    </span>
                  )}
                  <Link
                    href={`/platform/institutions/${institution.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    التفاصيل ←
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
