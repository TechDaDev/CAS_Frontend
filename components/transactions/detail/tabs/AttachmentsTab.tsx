'use client';

import { useState, useEffect, useCallback } from 'react';
import { Attachment } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { AttachmentUploadPanel } from '@/components/workflow/AttachmentUploadPanel';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';

interface AttachmentsTabProps {
  transactionId: string;
  institutionId: string;
  currentAssignmentId?: string | null;
  currentUnitId?: string | null;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) {
    return (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (mimeType.includes('image')) {
    return (
      <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
};

export function AttachmentsTab({ transactionId, institutionId, currentAssignmentId, currentUnitId }: AttachmentsTabProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionsWorkspaceService.getAttachments(transactionId);
      setAttachments(data);
    } catch (err) {
      setError('فشل تحميل المرفقات');
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل المرفقات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  if (attachments.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState 
          title="لا توجد مرفقات" 
          message="لا توجد مرفقات لهذه المعاملة بعد."
        />
        <AttachmentUploadPanel
          transactionId={transactionId}
          institutionId={institutionId}
          currentAssignmentId={currentAssignmentId}
          currentUnitId={currentUnitId}
          onSuccess={loadAttachments}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Attachments Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الملف
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الرافع
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الحجم
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الإجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {attachments.map((attachment) => (
                <tr key={attachment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getFileIcon(attachment.mime_type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{attachment.original_filename}</p>
                        {attachment.description && (
                          <p className="text-xs text-slate-500">{attachment.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {attachment.category_name || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {attachment.uploaded_by_email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {new Date(attachment.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {formatFileSize(attachment.file_size)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {attachment.mime_type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={attachment.file}
                      download
                      className="text-blue-600 hover:text-blue-900"
                    >
                      تحميل
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Panel */}
      <AttachmentUploadPanel
        transactionId={transactionId}
        institutionId={institutionId}
        currentAssignmentId={currentAssignmentId}
        currentUnitId={currentUnitId}
        onSuccess={loadAttachments}
      />
    </div>
  );
}
