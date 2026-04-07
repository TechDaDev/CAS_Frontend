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
import { InstitutionFormModal } from '@/components/platform/InstitutionFormModal';

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function InstitutionDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const institutionId = params.id as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isAssignDeanModalOpen, setIsAssignDeanModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const loadInstitution = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }
      setLoadError(null);
      const data = await institutionsService.getInstitution(institutionId);
      setInstitution(data);
    } catch {
      setLoadError('فشل تحميل بيانات المؤسسة');
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !institution) return;

    try {
      setIsUpdatingLogo(true);
      setFeedback(null);
      await institutionsService.updateInstitution(institutionId, { logo: file }, { method: 'PATCH' });
      await loadInstitution(false);
      setFeedback({ type: 'success', message: 'تم تحديث شعار المؤسسة بنجاح.' });
    } catch {
      setFeedback({ type: 'error', message: 'فشل تحديث الشعار.' });
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  const handleToggleInstitutionStatus = async () => {
    if (!institution) {
      return;
    }

    const isDeactivating = institution.is_active;
    const confirmed = window.confirm(
      isDeactivating
        ? `هل تريد تعطيل المؤسسة "${institution.name}"؟ يمكنك إعادة تفعيلها لاحقاً.`
        : `هل تريد إعادة تفعيل المؤسسة "${institution.name}"؟`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsStatusUpdating(true);
      setFeedback(null);

      if (isDeactivating) {
        await institutionsService.deactivateInstitution(institution.id);
      } else {
        await institutionsService.reactivateInstitution(institution.id);
      }

      await loadInstitution(false);
      setFeedback({
        type: 'success',
        message: isDeactivating ? 'تم تعطيل المؤسسة بنجاح.' : 'تمت إعادة تفعيل المؤسسة بنجاح.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: isDeactivating ? 'فشل تعطيل المؤسسة.' : 'فشل إعادة تفعيل المؤسسة.',
      });
    } finally {
      setIsStatusUpdating(false);
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

  const handleDeanAssigned = async () => {
    await loadInstitution(false);
    setIsAssignDeanModalOpen(false);
    setFeedback({ type: 'success', message: 'تم تعيين العميد بنجاح.' });
  };

  const handleInstitutionSaved = async () => {
    await loadInstitution(false);
    setIsEditModalOpen(false);
    setFeedback({ type: 'success', message: 'تم تحديث بيانات المؤسسة بنجاح.' });
  };

  if (authLoading || isLoading) {
    return <LoadingState message="جارٍ تحميل بيانات المؤسسة..." />;
  }

  if (loadError) {
    return <ErrorState title="خطأ" message={loadError} />;
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

      {feedback && (
        <div
          className={`rounded-md p-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
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
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              institution.is_active
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {institution.is_active ? 'نشط' : 'غير نشط'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsEditModalOpen(true);
              setFeedback(null);
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            تعديل المؤسسة
          </button>
          <button
            type="button"
            disabled={isStatusUpdating}
            onClick={handleToggleInstitutionStatus}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              institution.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isStatusUpdating
              ? 'جارٍ التنفيذ...'
              : institution.is_active
                ? 'تعطيل المؤسسة'
                : 'إعادة التفعيل'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">شعار المؤسسة</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
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

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">تفاصيل المؤسسة</h2>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
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

      <InstitutionFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleInstitutionSaved}
        institution={institution}
      />
    </div>
  );
}
