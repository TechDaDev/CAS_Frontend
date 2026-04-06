import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

export default function ApprovalsPage() {
  return (
    <div>
      <PageHeader 
        title="الموافقات" 
        subtitle="مراجعة وإدارة طلبات الموافقة" 
      />
      
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-blue-50 p-4">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900">وحدة الموافقات</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            تتضمن هذه الوحدة الموافقات المعلقة، سجل الموافقات، وإدارة التوقيعات.
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
