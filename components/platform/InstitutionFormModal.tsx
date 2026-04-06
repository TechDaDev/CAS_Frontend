'use client';

import { useState } from 'react';
import { institutionsService, CreateInstitutionData } from '@/services/institutions';
import { ApiError } from '@/services/api';

interface InstitutionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InstitutionFormModal({ isOpen, onClose, onSuccess }: InstitutionFormModalProps) {
  const [formData, setFormData] = useState<CreateInstitutionData>({
    name: '',
    slug: '',
    code: '',
    description: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      await institutionsService.createInstitution(formData);
      onSuccess();
      setFormData({
        name: '',
        slug: '',
        code: '',
        description: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        is_active: true,
      });
    } catch (err) {
      if (err instanceof ApiError && err.data) {
        const errorData = err.data as Record<string, string[]>;
        const fieldErrors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError('فشل إنشاء المؤسسة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateInstitutionData, value: string | boolean) => {
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
          <h2 className="text-xl font-semibold text-slate-900">إنشاء مؤسسة جديدة</h2>
          <p className="mt-1 text-sm text-slate-500">أدخل تفاصيل المؤسسة الجديدة</p>

          {generalError && (
            <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">الاسم *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="مثال: كلية العلوم"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">الرمز *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="مثال: SCI"
                />
                {errors.code && <p className="mt-1 text-xs text-rose-600">{errors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">الاختصار *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="مثال: science-college"
                />
                {errors.slug && <p className="mt-1 text-xs text-rose-600">{errors.slug}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="وصف مختصر للمؤسسة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">العنوان</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="عنوان المؤسسة"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
                {errors.contact_email && <p className="mt-1 text-xs text-rose-600">{errors.contact_email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">رقم الهاتف</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
              </div>
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
                مؤسسة نشطة
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
                {isSubmitting ? 'جارٍ الإنشاء...' : 'إنشاء'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
