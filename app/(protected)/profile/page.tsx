'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/services/api';
import { CurrentUser } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { PageHeader } from '@/components/PageHeader';

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function BooleanField({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-600">{label}</span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            value ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {value ? 'نعم' : 'لا'}
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setError(null);
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch {
        setError('فشل تحميل بيانات الملف الشخصي.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل الملف الشخصي..." />;
  }

  if (error || !user) {
    return <ErrorState title="خطأ" message={error || 'فشل تحميل الملف الشخصي'} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="ملفي الشخصي" subtitle="عرض للقراءة فقط. تحديث الملف الشخصي سيتوفر عند إضافة نقطة نهاية مخصصة في الخلفية." />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{user.first_name} {user.last_name}</h2>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            disabled
            className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400"
          >
            التعديل غير متاح حالياً
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReadOnlyField label="البريد الإلكتروني" value={user.email} />
          <ReadOnlyField label="الاسم الأول" value={user.first_name || '-'} />
          <ReadOnlyField label="الاسم الأخير" value={user.last_name || '-'} />
          <ReadOnlyField label="معرف المؤسسة" value={user.institution_id || '-'} />
          <ReadOnlyField label="اسم المؤسسة" value={user.institution_name || '-'} />
          <BooleanField label="الحساب نشط" value={user.is_active} />
          <BooleanField label="عضو فريق العمل" value={user.is_staff} />
          <BooleanField label="مسؤول عام" value={user.is_superuser} />
        </dl>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
        يعتمد هذا العرض على <span className="font-medium text-slate-900">GET /api/auth/me/</span> فقط. إذا كانت هناك حاجة لتحرير البيانات ذاتياً، فسيحتاج المنتج إلى نقطة نهاية مثل <span className="font-medium text-slate-900">PATCH /api/auth/me/</span>.
      </div>
    </div>
  );
}
