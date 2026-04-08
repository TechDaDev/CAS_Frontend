'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/api';
import { institutionUsersService } from '@/services/institutionUsers';
import { InstitutionUser } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { PageHeader } from '@/components/PageHeader';
import { UserCategoryBadge } from '@/components/institution-users/UserCategoryBadge';
import { InstitutionUserFormModal } from '@/components/institution-users/InstitutionUserFormModal';
import { FallbackImage } from '@/components/common/FallbackImage';

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default function InstitutionUserDetailPage() {
  const params = useParams();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const userId = params.id as string;

  const [institutionUser, setInstitutionUser] = useState<InstitutionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadInstitutionUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await institutionUsersService.getInstitutionUser(userId);
      setInstitutionUser(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError('هذا المستخدم غير موجود أو خارج نطاق مؤسستك.');
      } else if (err instanceof ApiError && err.status === 403) {
        setError('لا تملك صلاحية عرض بيانات هذا المستخدم.');
      } else {
        setError('فشل تحميل بيانات المستخدم.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading || !authUser) {
      return;
    }

    loadInstitutionUser();
  }, [authLoading, authUser, loadInstitutionUser]);

  if (authLoading || isLoading) {
    return <LoadingState message="جارٍ تحميل بيانات المستخدم..." />;
  }

  if (error || !institutionUser) {
    return <ErrorState title="خطأ" message={error || 'المستخدم غير موجود'} onRetry={loadInstitutionUser} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/institution-users" className="hover:text-slate-700">
          مستخدمو المؤسسة
        </Link>
        <span>/</span>
        <span className="text-slate-900">{institutionUser.full_name}</span>
      </div>

      <PageHeader
        title={institutionUser.full_name}
        subtitle="تفاصيل المستخدم ضمن نطاق المؤسسة. البريد الإلكتروني وكلمة المرور غير قابلين للتعديل من الواجهة الحالية."
        action={
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setIsModalOpen(true);
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            تعديل المستخدم
          </button>
        }
      />

      {feedback && (
        <div
          className={`rounded-md p-3 text-sm ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100">
              <FallbackImage
                src={institutionUser.profile_image}
                alt={institutionUser.full_name}
                className="h-full w-full object-cover"
                fallback={
                  <span className="text-2xl font-semibold text-slate-500">
                    {institutionUser.first_name[0]}{institutionUser.last_name[0]}
                  </span>
                }
              />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">{institutionUser.full_name}</h2>
            <p className="mt-1 text-sm text-slate-500">{institutionUser.email}</p>
            <div className="mt-4 flex items-center gap-2">
              <UserCategoryBadge category={institutionUser.user_category} />
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  institutionUser.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {institutionUser.is_active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">البيانات الأساسية</h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem label="الاسم الأول" value={institutionUser.first_name} />
              <DetailItem label="الاسم الأخير" value={institutionUser.last_name} />
              <DetailItem label="البريد الإلكتروني" value={institutionUser.email} />
              <DetailItem label="الفئة" value={institutionUser.user_category === 'teaching' ? 'تدريسي' : 'موظف'} />
              <DetailItem label="المؤسسة" value={institutionUser.institution_name || '-'} />
              <DetailItem label="معرف المستخدم" value={institutionUser.id} />
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">التتبع</h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem
                label="تاريخ الإنشاء"
                value={new Date(institutionUser.created_at).toLocaleString('ar-SA')}
              />
              <DetailItem
                label="آخر تحديث"
                value={new Date(institutionUser.updated_at).toLocaleString('ar-SA')}
              />
            </dl>
          </div>
        </div>
      </div>

      <InstitutionUserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async () => {
          await loadInstitutionUser();
          setIsModalOpen(false);
          setFeedback({ type: 'success', message: 'تم تحديث بيانات المستخدم بنجاح.' });
        }}
        user={institutionUser}
        defaultInstitutionId={institutionUser.institution}
        institutionName={institutionUser.institution_name}
      />
    </div>
  );
}