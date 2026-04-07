'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { institutionsService } from '@/services/institutions';
import { Institution } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';
import { InstitutionFormModal } from '@/components/platform/InstitutionFormModal';

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function InstitutionsListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [statusActionId, setStatusActionId] = useState<string | null>(null);

  const loadInstitutions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await institutionsService.listInstitutions({
        search: searchQuery || undefined,
        is_active: activeFilter ?? undefined,
      });
      setInstitutions(response.results);
    } catch {
      setError('فشل تحميل المؤسسات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user?.is_superuser) {
      router.push('/dashboard');
      return;
    }

    if (user?.is_superuser) {
      loadInstitutions();
    }
  }, [user, authLoading, router, searchQuery, activeFilter]);

  const handleInstitutionSaved = async () => {
    const wasEditing = !!selectedInstitution;
    await loadInstitutions();
    setIsModalOpen(false);
    setSelectedInstitution(null);
    setFeedback({
      type: 'success',
      message: wasEditing ? 'تم تحديث بيانات المؤسسة بنجاح.' : 'تم إنشاء المؤسسة بنجاح.',
    });
  };

  const handleToggleInstitutionStatus = async (institution: Institution) => {
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
      setStatusActionId(institution.id);
      setFeedback(null);

      if (isDeactivating) {
        await institutionsService.deactivateInstitution(institution.id);
      } else {
        await institutionsService.reactivateInstitution(institution.id);
      }

      await loadInstitutions();
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
      setStatusActionId(null);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingState message="جارٍ تحميل المؤسسات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المؤسسات</h1>
          <p className="text-sm text-slate-500">إدارة المؤسسات في المنصة</p>
        </div>
        <button
          onClick={() => {
            setSelectedInstitution(null);
            setIsModalOpen(true);
            setFeedback(null);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + إنشاء مؤسسة
        </button>
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

      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            title="البحث عن مؤسسة"
            placeholder="البحث باسم أو رمز المؤسسة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          title="فلترة بحسب الحالة"
          aria-label="فلترة بحسب الحالة"
          value={activeFilter === null ? '' : String(activeFilter)}
          onChange={(e) => {
            const value = e.target.value;
            setActiveFilter(value === '' ? null : value === 'true');
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">جميع الحالات</option>
          <option value="true">نشط</option>
          <option value="false">غير نشط</option>
        </select>
      </div>

      {institutions.length === 0 ? (
        <EmptyState
          title="لا توجد مؤسسات"
          message="لم يتم إنشاء أي مؤسسة بعد. قم بإنشاء مؤسستك الأولى."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الرمز
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الاختصار
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  العميد
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {institutions.map((institution) => (
                <tr key={institution.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                    {institution.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {institution.code}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {institution.slug}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        institution.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {institution.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {institution.dean ? (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                        {institution.dean.full_name}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        بلا عميد
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {institution.contact_email || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/platform/institutions/${institution.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        التفاصيل
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInstitution(institution);
                          setIsModalOpen(true);
                          setFeedback(null);
                        }}
                        className="text-slate-700 hover:text-slate-900"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        disabled={statusActionId === institution.id}
                        onClick={() => handleToggleInstitutionStatus(institution)}
                        className={institution.is_active ? 'text-rose-600 hover:text-rose-800 disabled:opacity-50' : 'text-emerald-600 hover:text-emerald-800 disabled:opacity-50'}
                      >
                        {statusActionId === institution.id
                          ? 'جارٍ التنفيذ...'
                          : institution.is_active
                            ? 'تعطيل'
                            : 'إعادة التفعيل'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InstitutionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInstitution(null);
        }}
        onSuccess={handleInstitutionSaved}
        institution={selectedInstitution}
      />
    </div>
  );
}
