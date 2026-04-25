'use client';

import { useState, FormEvent, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { attachmentsService, CreateAttachmentPayload } from '@/services/attachments';
import { ApiError } from '@/services/api';

interface AttachmentUploadPanelProps {
  transactionId: string;
  institutionId: string;
  currentAssignmentId?: string | null;
  currentUnitId?: string | null;
  onSuccess: () => void;
}

export function AttachmentUploadPanel({
  transactionId,
  institutionId,
  currentAssignmentId,
  currentUnitId,
  onSuccess,
}: AttachmentUploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentCategory, setAttachmentCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastExtractionStatus, setLastExtractionStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoriesQuery = useQuery({
    queryKey: ['attachment-categories'],
    queryFn: () => attachmentsService.getAttachmentCategories(),
  });

  const categories = categoriesQuery.data?.results ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setSelectedFile(null);
        setError('حجم الملف يتجاوز الحد المسموح به وهو 10 ميغابايت.');
        return;
      }

      setSelectedFile(file);
      setSuccess(false);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('يرجى اختيار ملف للرفع.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: CreateAttachmentPayload = {
        institution: institutionId,
        transaction: transactionId,
        file: selectedFile,
        attachment_category: attachmentCategory || undefined,
        description: description || undefined,
        uploaded_assignment: currentAssignmentId || undefined,
        uploaded_unit: currentUnitId || undefined,
      };

      const attachment = await attachmentsService.createAttachment(payload);
      setSuccess(true);
      setLastExtractionStatus(attachment.extraction?.status ?? attachment.extraction_status ?? null);
      setSelectedFile(null);
      setDescription('');
      setAttachmentCategory('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fields) {
        const firstFieldError = Object.values(err.fields)[0]?.[0];
        setError(firstFieldError || 'تعذر رفع المرفق.');
      } else {
        const apiError = err as { status?: number };
        if (apiError.status === 403) {
          setError('لا تملك صلاحية رفع المرفقات.');
        } else if (apiError.status === 413) {
          setError('حجم الملف كبير جداً.');
        } else {
          setError('فشل رفع المرفق. حاول مرة أخرى.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-900">رفع مرفق</h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          تم رفع المرفق بنجاح.
          {lastExtractionStatus && <span className="mr-2">حالة الاستخراج: {lastExtractionStatus}</span>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">الملف</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            required
          />
          {selectedFile && (
            <p className="mt-1 text-xs text-slate-500">
              الملف المختار: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">فئة المرفق</label>
          <select
            value={attachmentCategory}
            onChange={(e) => setAttachmentCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">بدون فئة</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesQuery.error && (
            <p className="mt-1 text-xs text-amber-600">تعذر تحميل فئات المرفقات، يمكنك المتابعة بدون اختيار فئة.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="أدخل وصفاً موجزاً للمرفق"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedFile}
          className="w-full rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'جارٍ الرفع...' : 'رفع المرفق'}
        </button>
      </form>
    </div>
  );
}
