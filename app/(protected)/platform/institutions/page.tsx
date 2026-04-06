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

export default function InstitutionsListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const loadInstitutions = async () => {
    try {
      setIsLoading(true);
      const response = await institutionsService.listInstitutions({
        search: searchQuery || undefined,
        is_active: activeFilter ?? undefined,
      });
      setInstitutions(response.results);
    } catch (err) {
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

  const handleInstitutionCreated = () => {
    loadInstitutions();
    setIsModalOpen(false);
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
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + إنشاء مؤسسة
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="البحث باسم أو رمز المؤسسة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
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

      {/* Table */}
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
                    <Link
                      href={`/platform/institutions/${institution.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InstitutionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInstitutionCreated}
      />
    </div>
  );
}
