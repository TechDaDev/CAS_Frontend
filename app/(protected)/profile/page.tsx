'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/api';
import { CurrentUser } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { UserCategoryBadge } from '@/components/institution-users/UserCategoryBadge';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل الملف الشخصي..." />;
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-500">فشل تحميل الملف الشخصي</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الملف الشخصي</h1>
        <p className="text-sm text-slate-500">عرض معلومات حسابك</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.first_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-medium text-slate-600">
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              {user.user_category && (
                <div className="mt-3">
                  <UserCategoryBadge category={user.user_category} />
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">الحالة</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {user.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              {user.is_superuser && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">نوع الحساب</span>
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                    مدير المنصة
                  </span>
                </div>
              )}
              {user.institution_name && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">المؤسسة</span>
                  <span className="text-sm font-medium text-slate-900">{user.institution_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">معلومات الحساب</h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">الاسم الأول</dt>
                <dd className="text-sm font-medium text-slate-900">{user.first_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">الاسم الأخير</dt>
                <dd className="text-sm font-medium text-slate-900">{user.last_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">البريد الإلكتروني</dt>
                <dd className="text-sm font-medium text-slate-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">معرف المستخدم</dt>
                <dd className="text-sm font-medium text-slate-900 font-mono">{user.id}</dd>
              </div>
              {user.institution_id && (
                <div>
                  <dt className="text-sm text-slate-500">معرف المؤسسة</dt>
                  <dd className="text-sm font-medium text-slate-900 font-mono">{user.institution_id}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">الصلاحيات</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className={user.is_active ? 'text-slate-900' : 'text-slate-500'}>
                  حساب نشط
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 rounded-full ${user.is_staff ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className={user.is_staff ? 'text-slate-900' : 'text-slate-500'}>
                  عضو فريق العمل
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 rounded-full ${user.is_superuser ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className={user.is_superuser ? 'text-slate-900' : 'text-slate-500'}>
                  مدير النظام (سوبر أدمن)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
