'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

const organizationSections = [
  {
    title: 'الهيكل التنظيمي',
    items: [
      { name: 'شجرة الهيكل', href: '/organization/tree', description: 'عرض الهيكل الهرمي للوحدات' },
      { name: 'الوحدات', href: '/organization/units', description: 'إدارة الوحدات التنظيمية' },
      { name: 'أنواع الوحدات', href: '/organization/unit-types', description: 'إعداد تصنيفات أنواع الوحدات' },
    ],
  },
  {
    title: 'المناصب',
    items: [
      { name: 'المناصب', href: '/organization/positions', description: 'إدارة المناصب داخل الوحدات' },
      { name: 'أنواع المناصب', href: '/organization/position-types', description: 'إعداد تصنيفات أنواع المناصب' },
    ],
  },
  {
    title: 'الأدوار والتخصيصات',
    items: [
      { name: 'التخصيصات', href: '/organization/assignments', description: 'إدارة تخصيص المستخدمين للمناصب' },
      { name: 'تعريفات الأدوار', href: '/organization/role-definitions', description: 'إعداد تعريفات الأدوار والصلاحيات' },
      { name: 'قواعد الهيكل', href: '/organization/structure-rules', description: 'إدارة قواعد صلاحيات الهيكل' },
    ],
  },
];

export default function OrganizationPage() {
  return (
    <div>
      <PageHeader title="إدارة الهيكل التنظيمي" subtitle="إدارة الهيكل المؤسسي، المناصب، الأدوار، والتخصيصات" />

      <div className="mt-6 space-y-8">
        {organizationSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-blue-50 p-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
