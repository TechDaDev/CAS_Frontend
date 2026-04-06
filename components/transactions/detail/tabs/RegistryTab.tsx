'use client';

import { useState, useEffect } from 'react';
import { IncomingRegistry, OutgoingRegistry } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';

interface RegistryTabProps {
  transactionId: string;
}

interface RegistrySectionProps {
  title: string;
  registry: IncomingRegistry | OutgoingRegistry | null;
  fields: { label: string; key: string; formatter?: (val: unknown) => string }[];
}

function RegistrySection({ title, registry, fields }: RegistrySectionProps) {
  if (!registry) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-medium text-slate-900">{title}</h3>
        </div>
        <div className="px-4 py-6 text-center text-sm text-slate-500">
          لا يوجد سجل {title.toLowerCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="font-medium text-slate-900">{title}</h3>
      </div>
      <dl className="divide-y divide-slate-200">
        {fields.map((field, index) => {
          const value = (registry as unknown as Record<string, unknown>)[field.key];
          const displayValue = field.formatter 
            ? field.formatter(value)
            : value !== null && value !== undefined 
              ? String(value) 
              : '-';

          return (
            <div key={index} className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-slate-500">{field.label}</dt>
              <dd className={`mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0 ${
                field.key === 'registry_number_display' ? 'font-mono' : ''
              }`}>
                {displayValue}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function RegistryTab({ transactionId }: RegistryTabProps) {
  const [incoming, setIncoming] = useState<IncomingRegistry | null>(null);
  const [outgoing, setOutgoing] = useState<OutgoingRegistry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRegistry = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [incomingData, outgoingData] = await Promise.all([
          transactionsWorkspaceService.getIncomingRegistry(transactionId),
          transactionsWorkspaceService.getOutgoingRegistry(transactionId),
        ]);
        setIncoming(incomingData);
        setOutgoing(outgoingData);
      } catch (err) {
        setError('فشل تحميل معلومات السجل');
      } finally {
        setIsLoading(false);
      }
    };
    loadRegistry();
  }, [transactionId]);

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل معلومات السجل..." />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={error} />;
  }

  if (!incoming && !outgoing) {
    return (
      <EmptyState 
        title="لا توجد سجلات" 
        message="هذه المعاملة لا تحتوي على سجلات واردة أو صادرة." 
      />
    );
  }

  const incomingFields = [
    { label: 'رقم السجل', key: 'registry_number_display' },
    { label: 'تاريخ الاستلام', key: 'received_at', formatter: (val: unknown) => val ? new Date(String(val)).toLocaleString('ar-SA') : '-' },
    { label: 'المستلم', key: 'received_by_name' },
    { label: 'تاريخ الإنشاء', key: 'created_at', formatter: (val: unknown) => val ? new Date(String(val)).toLocaleString('ar-SA') : '-' },
  ];

  const outgoingFields = [
    { label: 'رقم السجل', key: 'registry_number_display' },
    { label: 'تاريخ الإرسال', key: 'sent_at', formatter: (val: unknown) => val ? new Date(String(val)).toLocaleString('ar-SA') : '-' },
    { label: 'المرسل', key: 'sent_by_name' },
    { label: 'طريقة التسليم', key: 'delivery_method' },
    { label: 'الجهة المستلمة', key: 'recipient_entity' },
    { label: 'تاريخ الإنشاء', key: 'created_at', formatter: (val: unknown) => val ? new Date(String(val)).toLocaleString('ar-SA') : '-' },
  ];

  return (
    <div className="space-y-6">
      <RegistrySection 
        title="السجل الوارد" 
        registry={incoming} 
        fields={incomingFields}
      />
      <RegistrySection 
        title="السجل الصادر" 
        registry={outgoing} 
        fields={outgoingFields}
      />
    </div>
  );
}
