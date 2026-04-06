'use client';

import { useState, useEffect } from 'react';
import { ApprovalAction, DecisionType } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';

interface ApprovalHistoryTabProps {
  transactionId: string;
}

const decisionStyles: Record<DecisionType, string> = {
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  returned: 'bg-amber-100 text-amber-800',
  delegated: 'bg-blue-100 text-blue-800',
};

export function ApprovalHistoryTab({ transactionId }: ApprovalHistoryTabProps) {
  const [approvals, setApprovals] = useState<ApprovalAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApprovals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await transactionsWorkspaceService.getApprovalHistory(transactionId);
        setApprovals(data);
      } catch (err) {
        setError('فشل تحميل سجل الموافقات');
      } finally {
        setIsLoading(false);
      }
    };
    loadApprovals();
  }, [transactionId]);

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل الموافقات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  if (approvals.length === 0) {
    return (
      <EmptyState 
        title="لا يوجد سجل موافقات" 
        message="لم تتم الموافقة على هذه المعاملة بعد." 
      />
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <div 
          key={approval.id} 
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  decisionStyles[approval.decision]
                }`}>
                  {approval.decision.toUpperCase()}
                </span>
                <span className="text-sm text-slate-500">
                  by {approval.acted_by_email}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {approval.decision_note || 'No notes provided'}
              </p>
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                <span>Signature: {approval.signature_status}</span>
                <span>Method: {approval.signature_method}</span>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500">
              {new Date(approval.created_at).toLocaleString()}
              {approval.signed_at && (
                <p className="text-emerald-600">
                  Signed: {new Date(approval.signed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
