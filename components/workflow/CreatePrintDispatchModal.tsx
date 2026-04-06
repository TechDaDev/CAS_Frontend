'use client';

import { useState, FormEvent } from 'react';
import { registryService, CreatePrintDispatchPayload } from '@/services/registry';

interface CreatePrintDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  institutionId: string;
  outgoingRegistryEntryId?: string | null;
  onSuccess: () => void;
}

export function CreatePrintDispatchModal({
  isOpen,
  onClose,
  transactionId,
  institutionId,
  outgoingRegistryEntryId,
  onSuccess,
}: CreatePrintDispatchModalProps) {
  const [selectedRegistryEntry, setSelectedRegistryEntry] = useState(outgoingRegistryEntryId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreatePrintDispatchPayload = {
        institution: institutionId,
        transaction: transactionId,
      };

      if (selectedRegistryEntry) {
        payload.outgoing_registry_entry = selectedRegistryEntry;
      }

      await registryService.createPrintDispatch(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 403) {
        setError('You do not have permission to create print/dispatch records.');
      } else if (apiError.status === 400) {
        setError('A print/dispatch record already exists for this transaction.');
      } else {
        setError('Failed to create print/dispatch record. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Create Print & Dispatch Record</h2>
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
          <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Creating a new print/dispatch record</p>
            <p className="mt-1">This will initialize the lifecycle for physical document handling.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Outgoing Registry Entry (Optional)
            </label>
            <input
              type="text"
              value={selectedRegistryEntry}
              onChange={(e) => setSelectedRegistryEntry(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Registry entry ID if available..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Link to an existing outgoing registry entry if available
            </p>
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
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
