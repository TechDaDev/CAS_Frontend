import { 
  transactionStatusLabels, 
  priorityLabels, 
  routingStatusLabels,
  decisionLabels,
  printDispatchStatusLabels,
  uiLabels 
} from '@/lib/ui-ar';

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority' | 'routing' | 'decision' | 'printDispatch';
}

export function StatusBadge({ status, variant = 'status' }: StatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    // Transaction statuses + Routing + Decisions (shared styles)
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    archived: 'bg-slate-100 text-slate-600 border-slate-200',
    // Priorities
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    normal: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    urgent: 'bg-rose-100 text-rose-700 border-rose-200',
    // Routing statuses
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    received: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    // Read status
    read: 'bg-slate-100 text-slate-600 border-slate-200',
    unread: 'bg-blue-100 text-blue-700 border-blue-200',
    // Decisions
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    returned: 'bg-amber-100 text-amber-700 border-amber-200',
    delegated: 'bg-blue-100 text-blue-700 border-blue-200',
    // Print/Dispatch
    ready_for_print: 'bg-slate-100 text-slate-700 border-slate-200',
    prepared: 'bg-blue-100 text-blue-700 border-blue-200',
    printed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    delivered_for_signature: 'bg-amber-100 text-amber-700 border-amber-200',
    wet_signed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    delivered_to_registry: 'bg-blue-100 text-blue-700 border-blue-200',
    dispatched: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const normalizedStatus = status.toLowerCase();
  const style = statusStyles[normalizedStatus] || 'bg-slate-100 text-slate-700 border-slate-200';

  // Get Arabic label based on variant
  let displayStatus: string;
  switch (variant) {
    case 'priority':
      displayStatus = priorityLabels[normalizedStatus] || status;
      break;
    case 'routing':
      displayStatus = routingStatusLabels[normalizedStatus] || status;
      break;
    case 'decision':
      displayStatus = decisionLabels[normalizedStatus] || status;
      break;
    case 'printDispatch':
      displayStatus = printDispatchStatusLabels[normalizedStatus] || status;
      break;
    case 'status':
    default:
      displayStatus = transactionStatusLabels[normalizedStatus] || 
        (normalizedStatus === 'read' ? uiLabels.read : 
         normalizedStatus === 'unread' ? uiLabels.unread : status);
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {displayStatus}
    </span>
  );
}
