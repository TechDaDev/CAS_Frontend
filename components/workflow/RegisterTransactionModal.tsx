'use client';

import { useState, FormEvent } from 'react';
import { registryService, CreateIncomingRegistryPayload, CreateOutgoingRegistryPayload } from '@/services/registry';

interface RegisterTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  institutionId: string;
  currentAssignmentId?: string | null;
  currentUnitId?: string | null;
  onSuccess: () => void;
}

export function RegisterTransactionModal({
  isOpen,
  onClose,
  transactionId,
  institutionId,
  currentAssignmentId,
  currentUnitId,
  onSuccess,
}: RegisterTransactionModalProps) {
  const [registryType, setRegistryType] = useState<'incoming' | 'outgoing'>('incoming');
  const [registeredAssignment, setRegisteredAssignment] = useState(currentAssignmentId || '');
  const [registeredUnit, setRegisteredUnit] = useState(currentUnitId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [externalReference, setExternalReference] = useState('');
  const [subjectSnapshot, setSubjectSnapshot] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (registryType === 'incoming') {
        const payload: CreateIncomingRegistryPayload = {
          institution: institutionId,
          transaction: transactionId,
          registered_assignment: registeredAssignment,
          registered_unit: registeredUnit,
          received_date: date,
          sender_name: senderName || undefined,
          external_reference: externalReference || undefined,
          subject_snapshot: subjectSnapshot || undefined,
          notes: notes || undefined,
        };
        const result = await registryService.createIncomingRegistry(payload);
        setSuccessMessage(`Incoming registry entry created: ${result.registry_number_display}`);
      } else {
        const payload: CreateOutgoingRegistryPayload = {
          institution: institutionId,
          transaction: transactionId,
          registered_assignment: registeredAssignment,
          registered_unit: registeredUnit,
          sent_date: date,
          recipient_name: recipientName || undefined,
          external_reference: externalReference || undefined,
          subject_snapshot: subjectSnapshot || undefined,
          notes: notes || undefined,
        };
        const result = await registryService.createOutgoingRegistry(payload);
        setSuccessMessage(`Outgoing registry entry created: ${result.registry_number_display}`);
      }

      onSuccess();
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 403) {
        setError('You do not have permission to create registry entries.');
      } else {
        setError(`Failed to create ${registryType} registry entry. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Register Transaction</h2>
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

        {successMessage && (
          <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Registry Type</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setRegistryType('incoming')}
                className={`flex-1 rounded-l-md border px-4 py-2 text-sm font-medium ${
                  registryType === 'incoming'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Incoming
              </button>
              <button
                type="button"
                onClick={() => setRegistryType('outgoing')}
                className={`flex-1 rounded-r-md border px-4 py-2 text-sm font-medium ${
                  registryType === 'outgoing'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Outgoing
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Registered Assignment</label>
              <input
                type="text"
                value={registeredAssignment}
                onChange={(e) => setRegisteredAssignment(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Registered Unit</label>
              <input
                type="text"
                value={registeredUnit}
                onChange={(e) => setRegisteredUnit(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {registryType === 'incoming' ? 'Received Date' : 'Sent Date'}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {registryType === 'incoming' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="External sender..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="External recipient..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">External Reference</label>
            <input
              type="text"
              value={externalReference}
              onChange={(e) => setExternalReference(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Reference number..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Subject Snapshot</label>
            <input
              type="text"
              value={subjectSnapshot}
              onChange={(e) => setSubjectSnapshot(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Brief subject..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Additional notes..."
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
              disabled={isSubmitting || !!successMessage}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Registry Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
