import { Transaction } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';

interface OverviewTabProps {
  transaction: Transaction;
}

interface DetailItem {
  label: string;
  value: React.ReactNode;
  condition?: boolean;
}

export function OverviewTab({ transaction }: OverviewTabProps) {
  const detailItems: DetailItem[] = [
    { label: 'Title', value: transaction.title },
    { label: 'Subject', value: transaction.subject },
    { label: 'Description', value: transaction.description, condition: !!transaction.description },
    { label: 'Transaction Type', value: transaction.transaction_type_name },
    { label: 'Source Type', value: transaction.source_type },
    { label: 'Status', value: <StatusBadge status={transaction.status} /> },
    { label: 'Priority', value: <StatusBadge status={transaction.priority} variant="priority" /> },
    { label: 'Confidentiality', value: transaction.confidentiality },
    { label: 'Institution', value: transaction.institution_name, condition: !!transaction.institution_name },
    { label: 'Created By', value: transaction.created_by_email },
    { label: 'External Reference', value: transaction.external_reference, condition: !!transaction.external_reference },
    { label: 'Due Date', value: transaction.due_date ? new Date(transaction.due_date).toLocaleDateString() : '-', condition: !!transaction.due_date },
    { label: 'Created At', value: new Date(transaction.created_at).toLocaleString() },
    { label: 'Updated At', value: new Date(transaction.updated_at).toLocaleString() },
    { label: 'Print Ready', value: transaction.is_print_ready ? 'Yes' : 'No' },
    { label: 'Archived', value: transaction.is_archived ? 'Yes' : 'No' },
    { label: 'Requires Response', value: transaction.requires_response ? 'Yes' : 'No' },
    { label: 'Notes', value: transaction.notes, condition: !!transaction.notes },
  ];

  const visibleItems = detailItems.filter(item => item.condition !== false);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-medium text-slate-900">Transaction Details</h3>
        </div>
        <dl className="divide-y divide-slate-200">
          {visibleItems.map((item, index) => (
            <div key={index} className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-slate-500">{item.label}</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
