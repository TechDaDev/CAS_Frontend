import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

export default function RoutingPage() {
  return (
    <div>
      <PageHeader 
        title="الإحالات" 
        subtitle="صندوق الوارد والصادر للمعاملات" 
      />
      
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-blue-50 p-4">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900">وحدة الإحالات</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            تتضمن هذه الوحدة صندوق الوارد، الصادر، إجراءات الإحالة، و سير عمل تسليم المعاملات.
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
