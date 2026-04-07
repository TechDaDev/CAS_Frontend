'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { institutionsService } from '@/services/institutions';
import { Institution } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import Link from 'next/link';
import { AssignDeanModal } from '@/components/platform/AssignDeanModal';
import { FallbackImage } from '@/components/common/FallbackImage';

export default function InstitutionDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const institutionId = params.id as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignDeanModalOpen, setIsAssignDeanModalOpen] = useState(false);

  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);

  const loadInstitution = async () => {
    try {
      setIsLoading(true);
      const data = await institutionsService.getInstitution(institutionId);
      setInstitution(data);
    } catch (err) {
      setError('فشل تحميل بيانات المؤسسة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !institution) return;

    try {
      setIsUpdatingLogo(true);
      await institutionsService.updateInstitution(institutionId, { logo: file });
      await loadInstitution();
    } catch (err) {
      setError('فشل تحديث الشعار');
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user?.is_superuser) {
      router.push('/dashboard');
      return;
    }

    if (user?.is_superuser && institutionId) {
      loadInstitution();
    }
  }, [user, authLoading, router, institutionId]);

  const handleDeanAssigned = () => {
    loadInstitution();
    setIsAssignDeanModalOpen(false);
  };

  if (authLoading || isLoading) {
    return <LoadingState message="جارٍ تحميل بيانات المؤسسة..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  if (!institution) {
    return <ErrorState title="غير موجود" message="المؤسسة غير موجودة" />;
  }

  if (!user?.is_superuser) {
    return (
      <ErrorState
        title="وصول مقيد"
        message="ليس لديك صلاحية لعرض هذه الصفحة."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/platform" className="hover:text-slate-700">
          لوحة إدارة المنصة
        </Link>
        <span>/</span>
        <Link href="/platform/institutions" className="hover:text-slate-700">
          المؤسسات
        </Link>
        <span>/</span>
        <span className="text-slate-900">{institution.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
            <FallbackImage
              src={institution.logo}
              alt={institution.name}
              className="h-full w-full object-cover"
              fallback={<span className="text-2xl font-bold text-slate-400">{institution.name[0]}</span>}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{institution.name}</h1>
            <p className="text-sm text-slate-500">{institution.code} • {institution.slug}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              institution.is_active
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {institution.is_active ? 'نشط' : 'غير نشط'}
          </span>
        </div>
      </div>

      {/* Logo Upload Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">شعار المؤسسة</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
            <FallbackImage
              src={institution.logo}
              alt={institution.name}
              className="h-full w-full object-cover"
              fallback={
                <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
          <div>
            <label className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isUpdatingLogo ? 'جارٍ التحديث...' : 'تحديث الشعار'}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={isUpdatingLogo}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">الصور بصيغة JPG, PNG بحجم أقصى 2MB</p>
          </div>
        </div>
      </div>

      {/* Institution Details Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">تفاصيل المؤسسة</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500">الاسم</dt>
            <dd className="text-sm font-medium text-slate-900">{institution.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">الرمز</dt>
            <dd className="text-sm font-medium text-slate-900">{institution.code}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">الاختصار</dt>
            <dd className="text-sm font-medium text-slate-900">{institution.slug}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">البريد الإلكتروني</dt>
            <dd className="text-sm font-medium text-slate-900">{institution.contact_email || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">رقم الهاتف</dt>
            <dd className="text-sm font-medium text-slate-900">{institution.contact_phone || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">العنوان</dt>
            <dd className="text-sm font-medium text-slate-900">{institution.address || '-'}</dd>
          </div>
          {institution.description && (
            <div className="md:col-span-2">
              <dt className="text-sm text-slate-500">الوصف</dt>
              <dd className="text-sm font-medium text-slate-900">{institution.description}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Dean Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">العميد</h2>
          {!institution.dean && (
            <button
              onClick={() => setIsAssignDeanModalOpen(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              تعيين العميد
            </button>
          )}
        </div>

        {institution.dean ? (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-medium text-blue-700">
                  {institution.dean.first_name[0]}{institution.dean.last_name[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-slate-900">{institution.dean.full_name}</p>
                <p className="text-sm text-slate-500">{institution.dean.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-amber-800">لم يتم تعيين عميد لهذه المؤسسة بعد.</p>
            </div>
            <p className="mt-2 text-sm text-amber-700">
              يجب تعيين عميد لتمكين المؤسسة من العمل. العميد سيكون المسؤول عن إدارة هيكل المؤسسة والمعاملات.
            </p>
          </div>
        )}
      </div>

      <AssignDeanModal
        isOpen={isAssignDeanModalOpen}
        onClose={() => setIsAssignDeanModalOpen(false)}
        onSuccess={handleDeanAssigned}
        institutionId={institutionId}
      />
    </div>
  );
}
