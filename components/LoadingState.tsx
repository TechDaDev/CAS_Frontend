import { uiLabels } from '@/lib/ui-ar';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = uiLabels.loading }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
}
