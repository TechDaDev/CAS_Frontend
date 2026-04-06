'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuditLog } from '@/types';
import { auditService } from '@/services/audit';
import { PageHeader } from '@/components/PageHeader';
import { AuditLogTable } from '@/components/audit/AuditLogTable';
import { AuditLogDetailPanel } from '@/components/audit/AuditLogDetailPanel';
import { RestrictedState } from '@/components/common/RestrictedState';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { uiLabels } from '@/lib/ui-ar';

export default function AuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState<{
    action?: string;
    actor?: string;
    objectType?: string;
  }>({});

  const institutionId = user?.institution_id || '';

  const loadAuditLogs = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);
    try {
      const response = await auditService.getAuditLogs({
        institution: institutionId,
        action: filters.action,
        actor: filters.actor,
        objectType: filters.objectType,
      });
      setLogs(response.results);
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 403) {
        setIsForbidden(true);
      } else {
        setError('فشل تحميل سجل التدقيق');
      }
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.action, filters.actor, filters.objectType]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
  };

  if (isForbidden) {
    return (
      <div>
        <PageHeader title="سجل التدقيق" subtitle="سجل مراجعة النظام والتاريخ" />
        <div className="mt-6">
          <RestrictedState 
            title="الوصول مقيد" 
            message="لا تملك صلاحية عرض سجل التدقيق. الوصول مقتصر على المستخدمين المخولين فقط."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="سجل التدقيق" subtitle="سجل مراجعة النظام والتاريخ" />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="تصفية حسب الإجراء..."
            value={filters.action || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="تصفية حسب المستخدم..."
            value={filters.actor || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, actor: e.target.value || undefined }))}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="تصفية حسب نوع الكائن..."
            value={filters.objectType || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, objectType: e.target.value || undefined }))}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => setFilters({})}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            مسح التصفية
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <LoadingState message="جارٍ تحميل سجل التدقيق..." />
          ) : logs.length === 0 ? (
            <EmptyState title="لا يوجد سجل تدقيق" message="لا توجد سجلات تدقيق تطابق التصفية." />
          ) : (
            <AuditLogTable 
              logs={logs} 
              onRowClick={handleRowClick}
              selectedId={selectedLog?.id}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedLog ? (
            <AuditLogDetailPanel 
              log={selectedLog} 
              onClose={() => setSelectedLog(null)}
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">اختر سجل تدقيق لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
