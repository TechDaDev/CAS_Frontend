'use client';

import { useEffect, useState } from 'react';
import { institutionsService, CreateInstitutionData, UpdateInstitutionData } from '@/services/institutions';
import { Institution } from '@/types';
import { ApiError } from '@/services/api';
import { FallbackImage } from '@/components/common/FallbackImage';

interface InstitutionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  institution?: Institution | null;
}

const EMPTY_FORM_DATA: CreateInstitutionData = {
  name: '',
  slug: '',
  code: '',
  description: '',
  address: '',
  contact_email: '',
  contact_phone: '',
  is_active: true,
};

export function InstitutionFormModal({ isOpen, onClose, onSuccess, institution }: InstitutionFormModalProps) {
  const isEdit = !!institution;
  const [formData, setFormData] = useState<CreateInstitutionData>(EMPTY_FORM_DATA);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrors({});
    setGeneralError(null);
    setIsSubmitting(false);
    setLogoFile(null);

    if (institution) {
      setFormData({
        name: institution.name,
        slug: institution.slug,
        code: institution.code,
        description: institution.description || '',
        address: institution.address || '',
        contact_email: institution.contact_email || '',
        contact_phone: institution.contact_phone || '',
        is_active: institution.is_active,
      });
      setLogoPreview(institution.logo || null);
    } else {
      setFormData(EMPTY_FORM_DATA);
      setLogoPreview(null);
    }
  }, [institution, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      if (isEdit && institution) {
        const updateData: UpdateInstitutionData = {
          name: formData.name,
          slug: formData.slug,
          code: formData.code,
          description: formData.description,
          address: formData.address,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          is_active: formData.is_active,
          logo: logoFile || undefined,
        };

        await institutionsService.updateInstitution(institution.id, updateData, { method: 'PUT' });
      } else {
        await institutionsService.createInstitution(formData);
        setFormData(EMPTY_FORM_DATA);
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
      } else {
        setGeneralError(isEdit ? 'فشل تحديث المؤسسة. يرجى المحاولة مرة أخرى.' : 'فشل إنشاء المؤسسة. يرجى المحاولة مرة أخرى.');
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEdit ? 'تعديل المؤسسة' : 'إنشاء مؤسسة جديدة'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit ? 'حدّث بيانات المؤسسة وحالتها من النموذج التالي.' : 'أدخل تفاصيل المؤسسة الجديدة.'}
          </p>

          {generalError && (
            <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {isEdit && (
              <div>
                <label htmlFor="institution_logo" className="block text-sm font-medium text-slate-700">
                  شعار المؤسسة
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                    <FallbackImage
                      src={logoPreview}
                      alt={formData.name || 'Institution logo'}
                      className="h-full w-full object-cover"
                      fallback={<span className="text-xl font-bold text-slate-400">{formData.name?.[0] || 'C'}</span>}
                    />
                  </div>
                  <input
                    id="institution_logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="text-sm text-slate-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="institution_name" className="block text-sm font-medium text-slate-700">الاسم *</label>
              <input
                id="institution_name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="مثال: كلية العلوم"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="institution_code" className="block text-sm font-medium text-slate-700">الرمز *</label>
                <input
                  id="institution_code"
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
                <label htmlFor="institution_slug" className="block text-sm font-medium text-slate-700">الاختصار *</label>
                <input
                  id="institution_slug"
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
              <label htmlFor="institution_description" className="block text-sm font-medium text-slate-700">الوصف</label>
              <textarea
                id="institution_description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="وصف مختصر للمؤسسة..."
              />
            </div>

            <div>
              <label htmlFor="institution_address" className="block text-sm font-medium text-slate-700">العنوان</label>
              <input
                id="institution_address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="عنوان المؤسسة"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="institution_contact_email" className="block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                <input
                  id="institution_contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
                {errors.contact_email && <p className="mt-1 text-xs text-rose-600">{errors.contact_email}</p>}
              </div>
              <div>
                <label htmlFor="institution_contact_phone" className="block text-sm font-medium text-slate-700">رقم الهاتف</label>
                <input
                  id="institution_contact_phone"
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
                id="institution_is_active"
                checked={formData.is_active ?? false}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="institution_is_active" className="mr-2 text-sm text-slate-700">
                المؤسسة نشطة
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
                {isSubmitting ? (isEdit ? 'جارٍ الحفظ...' : 'جارٍ الإنشاء...') : (isEdit ? 'حفظ التغييرات' : 'إنشاء')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
