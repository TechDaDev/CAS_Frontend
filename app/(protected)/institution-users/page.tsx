'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { institutionUsersService } from '@/services/institutionUsers';
import { ApiError } from '@/services/api';
import { institutionsService } from '@/services/institutions';
import { Institution, InstitutionUser, UserCategory } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { UserCategoryBadge } from '@/components/institution-users/UserCategoryBadge';
import { InstitutionUserFormModal } from '@/components/institution-users/InstitutionUserFormModal';
import { FallbackImage } from '@/components/common/FallbackImage';
import { PageHeader } from '@/components/PageHeader';
import { PaginationControls } from '@/components/PaginationControls';

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function InstitutionUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [institutionUsers, setInstitutionUsers] = useState<InstitutionUser[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InstitutionUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<UserCategory | ''>('');
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const canSelectInstitution = !!user?.is_superuser;

  const loadInstitutionUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await institutionUsersService.listInstitutionUsers({
        search: searchQuery || undefined,
        user_category: (categoryFilter as UserCategory) || undefined,
        is_active: activeFilter ?? undefined,
        institution: canSelectInstitution ? institutionFilter || undefined : undefined,
        page: currentPage,
      });
      setInstitutionUsers(response.results);
      setTotalItems(response.count);
      setHasNextPage(Boolean(response.next));
      setHasPreviousPage(Boolean(response.previous));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError('لا تملك صلاحية عرض مستخدمي المؤسسة.');
      } else {
        setError('فشل تحميل مستخدمي المؤسسة');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, canSelectInstitution, categoryFilter, institutionFilter, searchQuery, currentPage]);

  const loadInstitutions = useCallback(async () => {
    if (!user?.is_superuser) {
      setInstitutions([]);
      return;
    }

    try {
      const response = await institutionsService.listInstitutions({ is_active: true });
      setInstitutions(response.results);
    } catch {
      setInstitutions([]);
    }
  }, [user?.is_superuser]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    loadInstitutionUsers();
  }, [authLoading, loadInstitutionUsers, user]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    loadInstitutions();
  }, [authLoading, loadInstitutions, user]);

  const handleUserCreated = () => {
    loadInstitutionUsers();
    setIsModalOpen(false);
    setSelectedUser(null);
    setFeedback({
      type: 'success',
      message: selectedUser ? 'تم تحديث بيانات المستخدم بنجاح.' : 'تم إنشاء المستخدم بنجاح.',
    });
  };

  const handleEditUser = (user: InstitutionUser) => {
    setFeedback(null);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (authLoading || isLoading) {
    return <LoadingState message="جارٍ تحميل مستخدمي المؤسسة..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مستخدمو المؤسسة"
        subtitle={user?.is_superuser
          ? 'إدارة مستخدمي المؤسسات عبر المنصة.'
          : 'متاح إنشاء المستخدمين للعميد أو للموظف المفوض حسب صلاحيات الهيكل التنظيمي.'}
        action={
          <button
            onClick={() => {
              setFeedback(null);
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + إنشاء مستخدم
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

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            value={searchQuery}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchQuery(e.target.value);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {canSelectInstitution && (
          <select
            value={institutionFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setInstitutionFilter(e.target.value);
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">جميع المؤسسات</option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
        )}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCurrentPage(1);
            setCategoryFilter(e.target.value as UserCategory | '');
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">جميع الفئات</option>
          <option value="teaching">تدريسي</option>
          <option value="staff">موظف</option>
        </select>
        <select
          value={activeFilter === null ? '' : String(activeFilter)}
          onChange={(e) => {
            const value = e.target.value;
            setCurrentPage(1);
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
      {institutionUsers.length === 0 ? (
        <EmptyState
          title="لا يوجد مستخدمون"
          message="لم يتم إنشاء أي مستخدم مؤسسة بعد. قم بإنشاء مستخدمك الأول."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  المؤسسة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  تاريخ الإنشاء
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {institutionUsers.map((institutionUser) => (
                <tr key={institutionUser.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        <FallbackImage
                          src={institutionUser.profile_image}
                          alt={institutionUser.full_name}
                          className="h-full w-full object-cover"
                          fallback={
                            <span className="text-sm font-medium text-slate-600">
                              {institutionUser.first_name[0]}{institutionUser.last_name[0]}
                            </span>
                          }
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{institutionUser.full_name}</p>
                        <p className="text-sm text-slate-500">{institutionUser.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <UserCategoryBadge category={institutionUser.user_category} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        institutionUser.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {institutionUser.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {institutionUser.institution_name || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {new Date(institutionUser.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/institution-users/${institutionUser.id}`}
                        className="text-slate-700 hover:text-slate-900"
                      >
                        التفاصيل
                      </Link>
                      <button
                        onClick={() => handleEditUser(institutionUser)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        تعديل
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalItems={totalItems}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      <InstitutionUserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleUserCreated}
        user={selectedUser}
        defaultInstitutionId={user?.institution_id}
        institutionName={user?.institution_name}
        allowInstitutionSelection={canSelectInstitution}
        institutionOptions={institutions}
      />
    </div>
  );
}
