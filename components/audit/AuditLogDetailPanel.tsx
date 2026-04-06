'use client';

import { AuditLog } from '@/types';
import Link from 'next/link';
import { auditActionLabels, uiLabels } from '@/lib/ui-ar';

interface AuditLogDetailPanelProps {
  log: AuditLog;
  onClose?: () => void;
}

export function AuditLogDetailPanel({ log, onClose }: AuditLogDetailPanelProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ar-SA');
  };

  const formatAction = (action: string) => {
    return auditActionLabels[action] || action;
  };

  const renderJson = (data: Record<string, unknown> | null) => {
    if (!data) return <span className="text-slate-400">-</span>;
    return (
      <pre className="max-h-48 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="font-medium text-slate-900">تفاصيل سجل التدقيق</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase">التاريخ والوقت</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatTimestamp(log.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase">الإجراء</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                {formatAction(log.action)}
              </span>
            </dd>
          </div>
        </div>

        <div>
          <dt className="text-xs font-medium text-slate-500 uppercase">المستخدم</dt>
          <dd className="mt-1 text-sm text-slate-900">{log.actor_email}</dd>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase">نوع الكائن</dt>
            <dd className="mt-1 text-sm text-slate-900">{log.object_type}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase">معرف الكائن</dt>
            <dd className="mt-1 text-sm text-slate-900">{log.object_id}</dd>
          </div>
        </div>

        <div>
          <dt className="text-xs font-medium text-slate-500 uppercase">تمثيل الكائن</dt>
          <dd className="mt-1 text-sm text-slate-900">{log.object_repr}</dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-slate-500 uppercase">المؤسسة</dt>
          <dd className="mt-1 text-sm text-slate-900">{log.institution_name}</dd>
        </div>

        {log.related_transaction && (
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase">المعاملة المرتبطة</dt>
            <dd className="mt-1 text-sm">
              <Link 
                href={`/transactions/${log.related_transaction}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {log.related_transaction_title || log.related_transaction}
              </Link>
            </dd>
          </div>
        )}

        {log.details && (
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase">التفاصيل</dt>
            <dd className="mt-1">{renderJson(log.details)}</dd>
          </div>
        )}

        {log.previous_state && (
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase">الحالة السابقة</dt>
            <dd className="mt-1">{renderJson(log.previous_state)}</dd>
          </div>
        )}

        {log.new_state && (
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase">الحالة الجديدة</dt>
            <dd className="mt-1">{renderJson(log.new_state)}</dd>
          </div>
        )}

        {(log.ip_address || log.user_agent) && (
          <div className="border-t border-slate-200 pt-4">
            <dt className="text-xs font-medium text-slate-500 uppercase">معلومات الطلب</dt>
            {log.ip_address && (
              <dd className="mt-1 text-sm text-slate-600">IP: {log.ip_address}</dd>
            )}
            {log.user_agent && (
              <dd className="mt-1 text-sm text-slate-600">وكيل المستخدم: {log.user_agent}</dd>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
