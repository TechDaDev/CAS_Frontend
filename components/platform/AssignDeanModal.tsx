'use client';

import { useState } from 'react';
import { institutionsService, AssignDeanData } from '@/services/institutions';
import { ApiError } from '@/services/api';

interface AssignDeanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  institutionId: string;
}

export function AssignDeanModal({ isOpen, onClose, onSuccess, institutionId }: AssignDeanModalProps) {
  const [formData, setFormData] = useState<AssignDeanData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
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
      await institutionsService.assignDean(institutionId, formData);
      onSuccess();
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
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
        setGeneralError('فشل تعيين العميد. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof AssignDeanData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">تعيين العميد</h2>
          <p className="mt-1 text-sm text-slate-500">
            قم بإنشاء حساب العميد للمؤسسة. العميد سيكون المسؤول عن إدارة المؤسسة.
          </p>

          {generalError && (
            <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">الاسم الأول *</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="محمد"
                />
                {errors.first_name && <p className="mt-1 text-xs text-rose-600">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">اسم العائلة *</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="الأحمد"
                />
                {errors.last_name && <p className="mt-1 text-xs text-rose-600">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">البريد الإلكتروني *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="dean@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">كلمة المرور *</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-slate-500">يجب أن تكون 8 أحرف على الأقل</p>
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
                {isSubmitting ? 'جارٍ التعيين...' : 'تعيين العميد'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
