'use client';

import { useState, useEffect } from 'react';
import { AuditLog } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';

interface AuditHistoryTabProps {
  transactionId: string;
}

export function AuditHistoryTab({ transactionId }: AuditHistoryTabProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const loadAudit = async () => {
      setIsLoading(true);
      setError(null);
      setAccessDenied(false);
      
      try {
        const result = await transactionsWorkspaceService.getAuditHistory(transactionId);
        setAuditLogs(result.logs);
        setAccessDenied(result.accessDenied);
      } catch (err) {
        setError('فشل تحميل سجل التدقيق');
      } finally {
        setIsLoading(false);
      }
    };
    loadAudit();
  }, [transactionId]);

  if (accessDenied) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-amber-50 p-3">
            <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-slate-900">وصول مقيد</h3>
          <p className="mt-1 text-sm text-slate-500">
            ليس لديك صلاحية لعرض سجل التدقيق لهذه المعاملة.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل سجل التدقيق..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  if (auditLogs.length === 0) {
    return (
      <EmptyState 
        title="لا توجد سجلات تدقيق" 
        message="لا يوجد سجل تدقيق متاح لهذه المعاملة." 
      />
    );
  }

  const actionStyles: Record<string, string> = {
    create: 'bg-emerald-100 text-emerald-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-rose-100 text-rose-800',
  };

  return (
    <div className="space-y-4">
      {/* Audit Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الإجراء
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  الكائن
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  التاريخ والوقت
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  التفاصيل
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      actionStyles[log.action] || 'bg-slate-100 text-slate-800'
                    }`}>
                      {log.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {log.actor_email}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <p className="font-medium">{log.object_repr}</p>
                    <p className="text-xs text-slate-500">{log.object_type}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                    {new Date(log.created_at).toLocaleString('ar-SA')}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <details className="group">
                        <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                          عرض التفاصيل
                        </summary>
                        <pre className="mt-2 max-w-xs overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
