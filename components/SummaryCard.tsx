import { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  variant = 'default' 
}: SummaryCardProps) {
  const variantStyles = {
    default: 'bg-white border-slate-200',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-rose-50 border-rose-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-md bg-white/80 p-2 text-slate-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
