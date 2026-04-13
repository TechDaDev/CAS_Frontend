'use client';

import { useEffect, useState, useRef } from 'react';
import { authService, ApiError } from '@/services/api';
import { CurrentUser } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { PageHeader } from '@/components/PageHeader';

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName || 'U')[0]}${(lastName || 'S')[0]}`.toUpperCase();
}

function AvatarFallback({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const [firstName, lastName] = name.split(' ');
  const sizeClasses = {
    md: 'h-12 w-12 text-sm',
    lg: 'h-20 w-20 text-base',
  };
  return (
    <div className={`rounded-full bg-blue-500 flex items-center justify-center text-white font-bold ${sizeClasses[size]}`}>
      {getInitials(firstName || '', lastName || '')}
    </div>
  );
}

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

function EditableField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={label} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={label}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setError(null);
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setProfileImagePreview(userData.profile_image || null);
      } catch {
        setError('فشل تحميل بيانات الملف الشخصي.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
    // Reset form to current user data
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setProfileImagePreview(user.profile_image || null);
      setProfileImageFile(null);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setSaveError(null);

      const updateData: {
        first_name?: string;
        last_name?: string;
        profile_image?: File | null;
      } = {};

      // Only include changed fields
      if (firstName !== (user?.first_name || '')) {
        updateData.first_name = firstName;
      }
      if (lastName !== (user?.last_name || '')) {
        updateData.last_name = lastName;
      }
      if (profileImageFile) {
        updateData.profile_image = profileImageFile;
      }

      await authService.updateProfile(updateData);
      const refreshedUser = await authService.getCurrentUser();
      setUser(refreshedUser);
      setFirstName(refreshedUser.first_name || '');
      setLastName(refreshedUser.last_name || '');
      setProfileImagePreview(refreshedUser.profile_image || null);
      setProfileImageFile(null);
      setIsEditing(false);
    } catch (err) {
      let errorMessage = 'فشل حفظ البيانات.';
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل الملف الشخصي..." />;
  }

  if (error || !user) {
    return <ErrorState title="خطأ" message={error || 'فشل تحميل الملف الشخصي'} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="ملفي الشخصي" subtitle="عرض وتحديث معلومات الملف الشخصي الخاص بك" />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {saveError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        )}

        {!isEditing ? (
          <>
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback name={`${user.first_name} ${user.last_name}`} size="lg" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEditClick}
                className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                تحرير البيانات
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
          </>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">تحرير الملف الشخصي</h3>
              <p className="mt-1 text-sm text-slate-600">قم بتحديث معلومات ملفك الشخصي أدناه</p>
            </div>

            {/* Profile Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">صورة الملف الشخصي</label>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback name={`${firstName} ${lastName}`} size="lg" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    تغيير الصورة
                  </button>
                  <p className="mt-1 text-xs text-slate-500">PNG, JPG (حد أقصى 5MB)</p>
                </div>
              </div>
            </div>

            {/* First Name */}
            <EditableField
              label="الاسم الأول"
              value={firstName}
              onChange={setFirstName}
              placeholder="أدخل اسمك الأول"
            />

            {/* Last Name */}
            <EditableField
              label="الاسم الأخير"
              value={lastName}
              onChange={setLastName}
              placeholder="أدخل اسمك الأخير"
            />

            {/* Read-only fields */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h4 className="text-sm font-medium text-slate-700">معلومات إضافية (غير قابلة للتعديل)</h4>
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadOnlyField label="البريد الإلكتروني" value={user.email} />
                <ReadOnlyField label="اسم المؤسسة" value={user.institution_name || '-'} />
              </dl>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 border-t border-slate-100 pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
