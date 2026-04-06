'use client';

import { useState } from 'react';
import { institutionUsersService, CreateInstitutionUserData, UpdateInstitutionUserData } from '@/services/institutionUsers';
import { InstitutionUser, UserCategory } from '@/types';
import { UserCategoryBadge } from './UserCategoryBadge';
import { ApiError } from '@/services/api';

interface InstitutionUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: InstitutionUser | null;
  institutionId: string;
}

export function InstitutionUserFormModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  institutionId,
}: InstitutionUserFormModalProps) {
  const isEdit = !!user;
  const [formData, setFormData] = useState<Partial<CreateInstitutionUserData>>({
    institution: institutionId,
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    user_category: user?.user_category || 'staff',
    is_active: user?.is_active ?? true,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profile_image || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      if (isEdit && user) {
        const updateData: UpdateInstitutionUserData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_active: formData.is_active,
          user_category: formData.user_category as UserCategory,
          profile_image: profileImage || undefined,
        };
        await institutionUsersService.updateInstitutionUser(user.id, updateData);
      } else {
        const createData: CreateInstitutionUserData = {
          institution: institutionId,
          email: formData.email || '',
          password: formData.password || '',
          first_name: formData.first_name || '',
          last_name: formData.last_name || '',
          user_category: (formData.user_category as UserCategory) || 'staff',
          profile_image: profileImage || undefined,
          is_active: formData.is_active,
        };
        await institutionUsersService.createInstitutionUser(createData);
      }
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.data) {
        const errorData = err.data as Record<string, string[]>;
        const fieldErrors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(fieldErrors);
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as Record<string, string[]>;
        const fieldErrors: Record<string, string> = {};
        Object.entries(errorObj).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(isEdit ? 'فشل تحديث المستخدم' : 'فشل إنشاء المستخدم');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEdit ? 'تعديل المستخدم' : 'إنشاء مستخدم'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit ? 'تحديث بيانات المستخدم' : 'إنشاء مستخدم مؤسسة جديد'}
          </p>

          {generalError && (
            <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700">الصورة الشخصية</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="text-sm text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">الاسم الأول *</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.first_name && <p className="mt-1 text-xs text-rose-600">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">الاسم الأخير *</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.last_name && <p className="mt-1 text-xs text-rose-600">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">البريد الإلكتروني *</label>
              <input
                type="email"
                required
                disabled={isEdit}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700">كلمة المرور *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                <p className="mt-1 text-xs text-slate-500">يجب أن تكون 8 أحرف على الأقل</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">الفئة *</label>
              <select
                value={formData.user_category}
                onChange={(e) => handleChange('user_category', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="teaching">تدريسي</option>
                <option value="staff">موظف</option>
              </select>
              {errors.user_category && <p className="mt-1 text-xs text-rose-600">{errors.user_category}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="mr-2 text-sm text-slate-700">
                مستخدم نشط
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'جارٍ الحفظ...' : isEdit ? 'حفظ' : 'إنشاء'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
