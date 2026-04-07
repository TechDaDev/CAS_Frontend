'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { institutionUsersService } from '@/services/institutionUsers';
import { InstitutionUser, UserCategory } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { UserCategoryBadge } from '@/components/institution-users/UserCategoryBadge';
import { InstitutionUserFormModal } from '@/components/institution-users/InstitutionUserFormModal';
import { FallbackImage } from '@/components/common/FallbackImage';

export default function InstitutionUsersPage() {
  const { user } = useAuth();
  const [institutionUsers, setInstitutionUsers] = useState<InstitutionUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InstitutionUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<UserCategory | ''>('');
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const institutionId = user?.institution_id;

  const loadInstitutionUsers = async () => {
    try {
      setIsLoading(true);
      const response = await institutionUsersService.listInstitutionUsers({
        search: searchQuery || undefined,
        user_category: (categoryFilter as UserCategory) || undefined,
        is_active: activeFilter ?? undefined,
        institution: institutionId || undefined,
      });
      setInstitutionUsers(response.results);
    } catch (err) {
      setError('فشل تحميل مستخدمي المؤسسة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutionUsers();
  }, [searchQuery, categoryFilter, activeFilter, institutionId]);

  const handleUserCreated = () => {
    loadInstitutionUsers();
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditUser = (user: InstitutionUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل مستخدمي المؤسسة..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مستخدمو المؤسسة</h1>
          <p className="text-sm text-slate-500">إدارة مستخدمي المؤسسة والفئات</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + إنشاء مستخدم
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as UserCategory | '')}
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
                    {new Date(institutionUser.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEditUser(institutionUser)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      تعديل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InstitutionUserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleUserCreated}
        user={selectedUser}
        institutionId={institutionId || ''}
      />
    </div>
  );
}
