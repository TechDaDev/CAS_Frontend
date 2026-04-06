'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

const committeeSections = [
  {
    title: 'إدارة اللجان',
    items: [
      { name: 'اللجان', href: '/committees/list', description: 'إدارة اللجان وإعداداتها' },
      { name: 'أنواع اللجان', href: '/committees/types', description: 'إعداد تصنيفات أنواع اللجان' },
      { name: 'أعضاء اللجان', href: '/committees/members', description: 'إدارة عضويات اللجان' },
    ],
  },
];

export default function CommitteesPage() {
  return (
    <div>
      <PageHeader title="إدارة اللجان" subtitle="إدارة اللجان، الأنواع، والأعضاء" />

      <div className="mt-6 space-y-8">
        {committeeSections.map((section) => (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
