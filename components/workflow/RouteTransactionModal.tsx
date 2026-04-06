'use client';

import { useState, FormEvent } from 'react';
import { RouteType, TargetMode } from '@/types';
import { routingService, CreateRoutingActionPayload } from '@/services/routing';

interface RouteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  institutionId: string;
  currentAssignmentId?: string | null;
  currentUnitId?: string | null;
  onSuccess: () => void;
}

export function RouteTransactionModal({
  isOpen,
  onClose,
  transactionId,
  institutionId,
  currentAssignmentId,
  currentUnitId,
  onSuccess,
}: RouteTransactionModalProps) {
  const [routeType, setRouteType] = useState<RouteType>('forward');
  const [targetMode, setTargetMode] = useState<TargetMode>('user');
  const [toUser, setToUser] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [toAssignment, setToAssignment] = useState('');
  const [toCommittee, setToCommittee] = useState('');
  const [marginNote, setMarginNote] = useState('');
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
      const payload: CreateRoutingActionPayload = {
        institution: institutionId,
        transaction: transactionId,
        route_type: routeType,
        target_mode: targetMode,
        from_assignment: currentAssignmentId || undefined,
        from_unit: currentUnitId || undefined,
        margin_note: marginNote || undefined,
      };

      // Add target based on target mode
      if (targetMode === 'user' && toUser) {
        payload.to_user = toUser;
      } else if (targetMode === 'unit' && toUnit) {
        payload.to_unit = toUnit;
      } else if (targetMode === 'assignment' && toAssignment) {
        payload.to_assignment = toAssignment;
      } else if (targetMode === 'committee' && toCommittee) {
        payload.to_committee = toCommittee;
      }

      await routingService.createRoutingAction(payload);
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
        setError('You do not have permission to route this transaction.');
      } else {
        setError('Failed to create routing action. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTargetField = () => {
    switch (targetMode) {
      case 'user':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700">Target User ID</label>
            <input
              type="text"
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter user ID"
              required
            />
            {fieldErrors.to_user && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.to_user}</p>
            )}
          </div>
        );
      case 'unit':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700">Target Unit ID</label>
            <input
              type="text"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter unit ID"
              required
            />
            {fieldErrors.to_unit && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.to_unit}</p>
            )}
          </div>
        );
      case 'assignment':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700">Target Assignment ID</label>
            <input
              type="text"
              value={toAssignment}
              onChange={(e) => setToAssignment(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter assignment ID"
              required
            />
            {fieldErrors.to_assignment && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.to_assignment}</p>
            )}
          </div>
        );
      case 'committee':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700">Target Committee ID</label>
            <input
              type="text"
              value={toCommittee}
              onChange={(e) => setToCommittee(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter committee ID"
              required
            />
            {fieldErrors.to_committee && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.to_committee}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Route Transaction</h2>
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
            <label className="block text-sm font-medium text-slate-700">Route Type</label>
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value as RouteType)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="forward">Forward</option>
              <option value="return">Return</option>
              <option value="referral">Referral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Target Mode</label>
            <select
              value={targetMode}
              onChange={(e) => setTargetMode(e.target.value as TargetMode)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="unit">Unit</option>
              <option value="assignment">Assignment</option>
              <option value="committee">Committee</option>
            </select>
          </div>

          {renderTargetField()}

          <div>
            <label className="block text-sm font-medium text-slate-700">Margin Note</label>
            <textarea
              value={marginNote}
              onChange={(e) => setMarginNote(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add a note for the recipient..."
            />
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
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Routing...' : 'Route Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
