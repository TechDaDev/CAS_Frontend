import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader 
        title="التقارير" 
        subtitle="تقارير وتحليلات النظام" 
      />
      
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-blue-50 p-4">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900">وحدة التقارير</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            ستتضمن هذه الوحدة تقارير مفصلة، تحليلات، وتصدير البيانات.
          </p>
          <div className="mt-6 flex gap-3">
            <Link 
              href="/dashboard" 
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              العودة إلى لوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
