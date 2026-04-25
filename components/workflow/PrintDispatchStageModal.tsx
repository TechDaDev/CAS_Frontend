'use client';

import { useState, FormEvent } from 'react';
import { PrintDispatch, PrintDispatchStatus } from '@/types';
import { registryService, PrintDispatchStagePayload } from '@/services/registry';

interface PrintDispatchStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  printDispatch: PrintDispatch;
  currentStage: PrintDispatchStatus;
  nextStage: PrintDispatchStatus;
  nextStageLabel: string;
  onSuccess: () => void;
}

const stageDescriptions: Record<PrintDispatchStatus, string> = {
  'ready_for_print': 'المستند جاهز للطباعة',
  'prepared': 'تم تجهيز المستند للطباعة',
  'printed': 'تمت طباعة المستند',
  'delivered_for_signature': 'تم تسليم المستند للتوقيع',
  'wet_signed': 'تم توقيع المستند توقيعاً أصلياً',
  'delivered_to_registry': 'تم تسليم المستند إلى السجل',
  'dispatched': 'تم إرسال المستند',
  'cancelled': 'تم إلغاء دورة الإرسال',
};

export function PrintDispatchStageModal({
  isOpen,
  onClose,
  printDispatch,
  currentStage,
  nextStage,
  nextStageLabel,
  onSuccess,
}: PrintDispatchStageModalProps) {
  const [actedAssignment, setActedAssignment] = useState('');
  const [dispatchReference, setDispatchReference] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDispatchStage = nextStage === 'dispatched';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: PrintDispatchStagePayload = {};
      if (actedAssignment) payload.acted_assignment = actedAssignment;
      if (isDispatchStage) {
        if (dispatchReference) payload.dispatch_reference = dispatchReference;
        if (dispatchNotes) payload.dispatch_notes = dispatchNotes;
      }

      const stageMethods: Record<PrintDispatchStatus, (id: string, p?: PrintDispatchStagePayload) => Promise<PrintDispatch>> = {
        'ready_for_print': registryService.markReadyForPrint,
        'prepared': registryService.markPrepared,
        'printed': registryService.markPrinted,
        'delivered_for_signature': registryService.markDeliveredForSignature,
        'wet_signed': registryService.markWetSigned,
        'delivered_to_registry': registryService.markDeliveredToRegistry,
        'dispatched': registryService.markDispatched,
        'cancelled': registryService.markDispatched,
      };

      const method = stageMethods[nextStage];
      await method(printDispatch.id, payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 403) {
        setError('لا تملك صلاحية الانتقال إلى هذه المرحلة.');
      } else if (apiError.status === 400) {
        setError('الانتقال بين المراحل غير صالح.');
      } else {
        setError('تعذر تحديث المرحلة. حاول مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{nextStageLabel}</h2>
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

        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          <p className="font-medium">المرحلة الحالية</p>
          <p>{stageDescriptions[currentStage]}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">المكلّف المنفذ</label>
            <input
              type="text"
              value={actedAssignment}
              onChange={(e) => setActedAssignment(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="أدخل معرف التكليف عند الحاجة"
            />
          </div>

          {isDispatchStage && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700">مرجع الإرسال</label>
                <input
                  type="text"
                  value={dispatchReference}
                  onChange={(e) => setDispatchReference(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="رقم المرجع"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">ملاحظات الإرسال</label>
                <textarea
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ملاحظات جهة التسليم أو شركة النقل"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'جارٍ المعالجة...' : nextStageLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
