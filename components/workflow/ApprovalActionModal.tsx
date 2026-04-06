'use client';

import { useState, FormEvent } from 'react';
import { DecisionType, SignatureMethod, SignatureStatus } from '@/types';
import { approvalsService, CreateApprovalActionPayload } from '@/services/approvals';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  institutionId: string;
  routingActionId?: string | null;
  currentAssignmentId: string;
  onSuccess: () => void;
}

export function ApprovalActionModal({
  isOpen,
  onClose,
  transactionId,
  institutionId,
  routingActionId,
  currentAssignmentId,
  onSuccess,
}: ApprovalActionModalProps) {
  const [decision, setDecision] = useState<DecisionType>('approved');
  const [decisionNote, setDecisionNote] = useState('');
  const [signatureMethod, setSignatureMethod] = useState<SignatureMethod>('system_recorded');
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload: CreateApprovalActionPayload = {
        institution: institutionId,
        transaction: transactionId,
        acted_assignment: currentAssignmentId,
        decision,
        decision_note: decisionNote || undefined,
        signature_method: signatureMethod,
        signature_status: signatureStatus,
      };

      if (routingActionId) {
        (payload as CreateApprovalActionPayload & { routing_action?: string }).routing_action = routingActionId;
      }

      await approvalsService.createApprovalAction(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFieldErrors(errors);
      } else if (apiError.status === 403) {
        setError('You do not have permission to approve this transaction.');
      } else {
        setError('Failed to submit approval. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Submit Approval</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Decision</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as DecisionType)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="returned">Returned</option>
              <option value="delegated">Delegated</option>
            </select>
            {fieldErrors.decision && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.decision}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Decision Note</label>
            <textarea
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add notes about your decision..."
            />
            {fieldErrors.decision_note && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.decision_note}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Signature Method</label>
              <select
                value={signatureMethod}
                onChange={(e) => setSignatureMethod(e.target.value as SignatureMethod)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="system_recorded">System Recorded</option>
                <option value="wet_ink">Wet Ink</option>
                <option value="digital">Digital</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Signature Status</label>
              <select
                value={signatureStatus}
                onChange={(e) => setSignatureStatus(e.target.value as SignatureStatus)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="signed">Signed</option>
                <option value="waived">Waived</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
