import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

export default function PrintDispatchPage() {
  return (
    <div>
      <PageHeader 
        title="الطباعة والإرسال" 
        subtitle="دورة حياة طباعة المستندات وإرسالها" 
      />
      
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-blue-50 p-4">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900">وحدة الطباعة والإرسال</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            تتضمن هذه الوحدة تحضير الطباعة، إدارة مراحل دورة الحياة، وتتبع الإرسال.
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
