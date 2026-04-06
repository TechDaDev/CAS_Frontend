import { uiLabels } from '@/lib/ui-ar';

interface RestrictedStateProps {
  title?: string;
  message?: string;
}

export function RestrictedState({ 
  title = uiLabels.accessDenied, 
  message = uiLabels.accessDeniedMessage 
}: RestrictedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-12 text-center">
      <div className="rounded-full bg-amber-50 p-4">
        <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">{message}</p>
    </div>
  );
}
