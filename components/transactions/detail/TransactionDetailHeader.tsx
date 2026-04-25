'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { StatusBadge } from '@/components/StatusBadge';
import { RouteTransactionModal } from '@/components/workflow/RouteTransactionModal';
import { ApprovalActionModal } from '@/components/workflow/ApprovalActionModal';
import { RegisterTransactionModal } from '@/components/workflow/RegisterTransactionModal';
import { CreatePrintDispatchModal } from '@/components/workflow/CreatePrintDispatchModal';
import Link from 'next/link';

interface TransactionDetailHeaderProps {
  transaction: Transaction;
  onWorkspaceUpdate: () => void;
}

export function TransactionDetailHeader({ transaction, onWorkspaceUpdate }: TransactionDetailHeaderProps) {
  const permissions = usePermissions();
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
        <Link href="/transactions" className="hover:text-slate-900">
          المعاملات
        </Link>
        <span>/</span>
        <span>التفاصيل</span>
      </div>

      {/* Header Content */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{transaction.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{transaction.subject}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <StatusBadge status={transaction.status} />
            <StatusBadge status={transaction.priority} variant="priority" />
            {transaction.is_archived && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                مؤرشفة
              </span>
            )}
          </div>
        </div>

        {/* Action Area - Enabled for Phase D */}
        <div className="flex gap-2 flex-wrap">
          {permissions.canRouteTransaction && (
            <button
              onClick={() => setIsRouteModalOpen(true)}
              className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              إحالة
            </button>
          )}
          {permissions.canApproveTransaction && (
            <button
              onClick={() => setIsApproveModalOpen(true)}
              className="rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-100"
            >
              اعتماد
            </button>
          )}
          {(permissions.canRegisterIncoming || permissions.canRegisterOutgoing) && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-100"
            >
              تسجيل
            </button>
          )}
          {permissions.canPreparePrint && !transaction.is_print_ready && (
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="rounded-md bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-100"
            >
              إنشاء دورة الطباعة
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <RouteTransactionModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        transactionId={transaction.id}
        institutionId={transaction.institution}
        currentAssignmentId={transaction.current_assignment}
        currentUnitId={transaction.current_unit}
        onSuccess={onWorkspaceUpdate}
      />

      <ApprovalActionModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        transactionId={transaction.id}
        institutionId={transaction.institution}
        currentAssignmentId={transaction.current_assignment || ''}
        onSuccess={onWorkspaceUpdate}
      />

      <RegisterTransactionModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        transactionId={transaction.id}
        institutionId={transaction.institution}
        currentAssignmentId={transaction.current_assignment}
        currentUnitId={transaction.current_unit}
        onSuccess={onWorkspaceUpdate}
      />

      <CreatePrintDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        transactionId={transaction.id}
        institutionId={transaction.institution}
        onSuccess={onWorkspaceUpdate}
      />
    </div>
  );
}
