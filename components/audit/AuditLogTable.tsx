'use client';

import { useState } from 'react';
import { AuditLog } from '@/types';
import Link from 'next/link';
import { auditActionLabels, uiLabels } from '@/lib/ui-ar';

interface AuditLogTableProps {
  logs: AuditLog[];
  onRowClick?: (log: AuditLog) => void;
  selectedId?: string | null;
}

export function AuditLogTable({ logs, onRowClick, selectedId }: AuditLogTableProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ar-SA');
  };

  const formatAction = (action: string) => {
    return auditActionLabels[action] || action;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-right font-medium text-slate-700">التاريخ والوقت</th>
            <th className="px-4 py-3 text-right font-medium text-slate-700">الإجراء</th>
            <th className="px-4 py-3 text-right font-medium text-slate-700">المستخدم</th>
            <th className="px-4 py-3 text-right font-medium text-slate-700">الكائن</th>
            <th className="px-4 py-3 text-right font-medium text-slate-700">المؤسسة</th>
            <th className="px-4 py-3 text-right font-medium text-slate-700">المعاملة المرتبطة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {logs.map((log) => (
            <tr
              key={log.id}
              onClick={() => onRowClick?.(log)}
              className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                selectedId === log.id ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <td className="px-4 py-3 text-slate-600">
                {formatTimestamp(log.created_at)}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {formatAction(log.action)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {log.actor_email}
              </td>
              <td className="px-4 py-3">
                <div className="text-slate-700">{log.object_repr}</div>
                <div className="text-xs text-slate-500">{log.object_type}</div>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {log.institution_name}
              </td>
              <td className="px-4 py-3">
                {log.related_transaction ? (
                  <Link
                    href={`/transactions/${log.related_transaction}`}
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {log.related_transaction_title || uiLabels.view}
                  </Link>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
