'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoutingAction } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { routingService } from '@/services/routing';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';

interface RoutingHistoryTabProps {
  transactionId: string;
}

export function RoutingHistoryTab({ transactionId }: RoutingHistoryTabProps) {
  const [routingHistory, setRoutingHistory] = useState<RoutingAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingActionId, setProcessingActionId] = useState<string | null>(null);

  const loadRouting = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionsWorkspaceService.getRoutingHistory(transactionId);
      setRoutingHistory(data);
    } catch (err) {
      setError('فشل تحميل سجل الإحالات');
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    loadRouting();
  }, [loadRouting]);

  const handleMarkReceived = async (actionId: string) => {
    setProcessingActionId(actionId);
    setActionError(null);
    try {
      await routingService.markReceived(actionId);
      await loadRouting();
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 403) {
        setActionError('You do not have permission to mark this as received.');
      } else {
        setActionError('فشل تحديد كمستلم. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setProcessingActionId(null);
    }
  };

  const handleMarkCompleted = async (actionId: string) => {
    setProcessingActionId(actionId);
    setActionError(null);
    try {
      await routingService.markCompleted(actionId);
      await loadRouting();
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 403) {
        setActionError('You do not have permission to mark this as completed.');
      } else {
        setActionError('فشل تحديد كمكتمل. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setProcessingActionId(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل سجل الإحالات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  if (routingHistory.length === 0) {
    return (
      <EmptyState 
        title="لا يوجد سجل إحالات" 
        message="لم يتم إحالة هذه المعاملة بعد. استخدم زر الإحالة في العنوان لإحالة هذه المعاملة."
      />
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      
      <div className="flow-root">
        <ul className="-mb-8">
          {routingHistory.map((action, index) => (
            <li key={action.id} className="relative pb-8">
              {index !== routingHistory.length - 1 && (
                <span 
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" 
                  aria-hidden="true" 
                />
              )}
              <div className="relative flex space-x-3">
                <div 
                  className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${
                    action.status === 'received' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                >
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{action.sent_by_email}</span>
                      {' '}
                      {action.route_type === 'forward' ? 'أحال' : 
                       action.route_type === 'return' ? 'أعاد' : 'حول'} هذه المعاملة
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      الحالة: <StatusBadge status={action.status} />
                    </p>
                    {action.margin_note && (
                      <p className="mt-1 text-sm text-slate-600 italic">
                        &ldquo;{action.margin_note}&rdquo;
                      </p>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="mt-2 flex gap-2">
                      {action.status === 'sent' && (
                        <button
                          onClick={() => handleMarkReceived(action.id)}
                          disabled={processingActionId === action.id}
                          className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {processingActionId === action.id ? 'جارٍ المعالجة...' : 'تحديد كمستلم'}
                        </button>
                      )}
                      {action.status === 'received' && (
                        <button
                          onClick={() => handleMarkCompleted(action.id)}
                          disabled={processingActionId === action.id}
                          className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                        >
                          {processingActionId === action.id ? 'جارٍ المعالجة...' : 'تحديد كمكتمل'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-slate-500">
                    <time dateTime={action.sent_at}>
                      {new Date(action.sent_at).toLocaleString('ar-SA')}
                    </time>
                    {action.received_at && (
                      <p className="text-emerald-600">
                        تم الاستلام: {new Date(action.received_at).toLocaleString('ar-SA')}
                      </p>
                    )}
                    {action.completed_at && (
                      <p className="text-blue-600">
                        تم الاكتمال: {new Date(action.completed_at).toLocaleString('ar-SA')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
