'use client';

import { useState, useEffect, useCallback } from 'react';
import { PrintDispatch, PrintDispatchStatus } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { CreatePrintDispatchModal } from '@/components/workflow/CreatePrintDispatchModal';
import { PrintDispatchStageModal } from '@/components/workflow/PrintDispatchStageModal';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';

interface PrintDispatchTabProps {
  transactionId: string;
  institutionId: string;
}

interface StageInfo {
  key: PrintDispatchStatus;
  label: string;
  timestamp: string | null;
  actor: string | null;
}

export function PrintDispatchTab({ transactionId, institutionId }: PrintDispatchTabProps) {
  const [printDispatch, setPrintDispatch] = useState<PrintDispatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<{
    current: PrintDispatchStatus;
    next: PrintDispatchStatus;
    label: string;
  } | null>(null);

  const loadPrintDispatch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionsWorkspaceService.getPrintDispatch(transactionId);
      setPrintDispatch(data);
    } catch (err) {
      setError('فشل تحميل معلومات الطباعة/الإرسال');
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    loadPrintDispatch();
  }, [loadPrintDispatch]);

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل معلومات الطباعة/الإرسال..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  if (!printDispatch) {
    return (
      <div className="space-y-4">
        <EmptyState 
          title="لا يوجد سجل طباعة/إرسال" 
          message="لم تدخل هذه المعاملة إلى دورة حياة الطباعة والإرسال بعد."
        />
        <div className="text-center">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            إنشاء سجل طباعة وإرسال
          </button>
        </div>
        {institutionId && (
          <CreatePrintDispatchModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            transactionId={transactionId}
            institutionId={institutionId}
            onSuccess={loadPrintDispatch}
          />
        )}
      </div>
    );
  }

  const stages: StageInfo[] = [
    { 
      key: 'ready_for_print', 
      label: 'جاهز للطباعة', 
      timestamp: printDispatch.created_at,
      actor: null 
    },
    { 
      key: 'prepared', 
      label: 'تم التحضير', 
      timestamp: printDispatch.prepared_at,
      actor: printDispatch.prepared_by 
    },
    { 
      key: 'printed', 
      label: 'تمت الطباعة', 
      timestamp: printDispatch.printed_at,
      actor: printDispatch.printed_by 
    },
    { 
      key: 'delivered_for_signature', 
      label: 'تم التوصيل للتوقيع', 
      timestamp: printDispatch.delivered_for_signature_at,
      actor: null 
    },
    { 
      key: 'wet_signed', 
      label: 'تم التوقيع بالحبر', 
      timestamp: printDispatch.wet_signed_at,
      actor: printDispatch.wet_signed_by 
    },
    { 
      key: 'delivered_to_registry', 
      label: 'تم التوصيل للسجل', 
      timestamp: printDispatch.delivered_to_registry_at,
      actor: printDispatch.delivered_to_registry_by 
    },
    { 
      key: 'dispatched', 
      label: 'تم الإرسال', 
      timestamp: printDispatch.dispatched_at,
      actor: printDispatch.dispatched_by 
    },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === printDispatch.status);

  // Determine next stage
  const stageTransitions: Record<PrintDispatchStatus, { next: PrintDispatchStatus; label: string } | null> = {
    'ready_for_print': { next: 'prepared', label: 'تحديد كمحضر' },
    'prepared': { next: 'printed', label: 'تحديد كمطبوع' },
    'printed': { next: 'delivered_for_signature', label: 'تحديد كموصل للتوقيع' },
    'delivered_for_signature': { next: 'wet_signed', label: 'تحديد كموقع بالحبر' },
    'wet_signed': { next: 'delivered_to_registry', label: 'تحديد كموصل للسجل' },
    'delivered_to_registry': { next: 'dispatched', label: 'تحديد كمرسل' },
    'dispatched': null,
    'cancelled': null,
  };

  const nextTransition = stageTransitions[printDispatch.status];

  const handleOpenStageModal = () => {
    if (nextTransition) {
      setSelectedStage({
        current: printDispatch.status,
        next: nextTransition.next,
        label: nextTransition.label,
      });
      setIsStageModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-900">دورة حياة الطباعة/الإرسال</h3>
            <p className="text-sm text-slate-500">
              الحالة الحالية: <StatusBadge status={printDispatch.status.replace(/_/g, '-')} />
            </p>
          </div>
          {nextTransition && (
            <button
              onClick={handleOpenStageModal}
              className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
            >
              {nextTransition.label}
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="flow-root">
            <ul className="-mb-8">
              {stages.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <li key={stage.key} className="relative pb-8">
                    {index !== stages.length - 1 && (
                      <span 
                        className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                        }`} 
                        aria-hidden="true" 
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div 
                        className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-300'
                        } ${isCurrent ? 'ring-emerald-100' : ''}`}
                      >
                        {isCompleted ? (
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className={`text-sm font-medium ${
                            isCompleted ? 'text-slate-900' : 'text-slate-500'
                          } ${isCurrent ? 'text-emerald-700' : ''}`}>
                            {stage.label}
                            {isCurrent && (
                              <span className="mr-2 text-xs font-normal text-emerald-600">
                                (الحالية)
                              </span>
                            )}
                          </p>
                          {stage.actor && (
                            <p className="text-xs text-slate-500">بواسطة {stage.actor}</p>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-slate-500">
                          {stage.timestamp && (
                            <time dateTime={stage.timestamp}>
                              {new Date(stage.timestamp).toLocaleString()}
                            </time>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {printDispatch.dispatch_reference && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="font-medium text-slate-900">معلومات الإرسال</h4>
          <dl className="mt-2 space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">المرجع</dt>
              <dd className="text-sm font-mono text-slate-900">
                {printDispatch.dispatch_reference}
              </dd>
            </div>
            {printDispatch.dispatch_notes && (
              <div className="flex justify-between">
                <dt className="text-sm text-slate-500">الملاحظات</dt>
                <dd className="text-sm text-slate-900">{printDispatch.dispatch_notes}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
      {selectedStage && (
        <PrintDispatchStageModal
          isOpen={isStageModalOpen}
          onClose={() => {
            setIsStageModalOpen(false);
            setSelectedStage(null);
          }}
          printDispatch={printDispatch}
          currentStage={selectedStage.current}
          nextStage={selectedStage.next}
          nextStageLabel={selectedStage.label}
          onSuccess={loadPrintDispatch}
        />
      )}
    </div>
  );
}
