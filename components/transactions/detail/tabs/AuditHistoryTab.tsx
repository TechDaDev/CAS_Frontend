'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { AuditLog } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { PaginationControls } from '@/components/PaginationControls';
import { RestrictedState } from '@/components/common/RestrictedState';

interface AuditHistoryTabProps {
  transactionId: string;
}

export function AuditHistoryTab({ transactionId }: AuditHistoryTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const auditQuery = useQuery({
    queryKey: ['transaction-audit-history', transactionId, currentPage],
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => transactionsWorkspaceService.getAuditHistory(transactionId, { page: currentPage, signal }),
  });

  const accessDenied = auditQuery.data?.accessDenied ?? false;

  if (accessDenied) {
    return <RestrictedState message="ليس لديك صلاحية لعرض سجل التدقيق لهذه المعاملة." />;
  }

  if (auditQuery.isLoading && !auditQuery.data) {
    return <LoadingState message="جارٍ تحميل سجل التدقيق..." />;
  }

  if (auditQuery.error) {
    return <ErrorState title="خطأ" message="فشل تحميل سجل التدقيق" />;
  }

  const auditLogs: AuditLog[] = auditQuery.data?.page.results ?? [];

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

      <PaginationControls
        currentPage={currentPage}
        totalItems={auditQuery.data?.page.count ?? 0}
        hasNextPage={Boolean(auditQuery.data?.page.next)}
        hasPreviousPage={Boolean(auditQuery.data?.page.previous)}
        onPageChange={setCurrentPage}
        isLoading={auditQuery.isFetching}
      />
    </div>
  );
}
