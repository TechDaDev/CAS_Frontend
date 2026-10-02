'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { OrganizationAccessGuard } from '@/components/organization/OrganizationAccessGuard';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionAction } from '@/hooks/useAuth';
import { uiLabels } from '@/lib/ui-ar';

interface OrganizationCard {
  name: string;
  href: string;
  description: string;
  /** Capability required to see and open the card. */
  capability: PermissionAction;
}

const organizationSections: Array<{ title: string; items: OrganizationCard[] }> = [
  {
    title: 'الهيكل التنظيمي',
    items: [
      {
        name: 'شجرة الهيكل',
        href: '/organization/tree',
        description: 'عرض الهيكل الهرمي للوحدات',
        capability: 'view_organization',
      },
      {
        name: 'الوحدات',
        href: '/organization/units',
        description: 'إدارة الوحدات التنظيمية',
        capability: 'view_organization',
      },
      {
        name: 'أنواع الوحدات',
        href: '/organization/unit-types',
        description: 'إعداد تصنيفات أنواع الوحدات',
        capability: 'manage_structure_definitions',
      },
    ],
  },
  {
    title: 'المناصب',
    items: [
      {
        name: 'المناصب',
        href: '/organization/positions',
        description: 'إدارة المناصب داخل الوحدات',
        capability: 'view_organization',
      },
      {
        name: 'أنواع المناصب',
        href: '/organization/position-types',
        description: 'إعداد تصنيفات أنواع المناصب',
        capability: 'manage_structure_definitions',
      },
    ],
  },
  {
    title: 'الأدوار والتخصيصات',
    items: [
      {
        name: 'التخصيصات',
        href: '/organization/assignments',
        description: 'إدارة تخصيص المستخدمين للمناصب',
        capability: 'view_organization',
      },
      {
        name: 'تعريفات الأدوار',
        href: '/organization/role-definitions',
        description: 'إعداد تعريفات الأدوار والصلاحيات',
        capability: 'manage_structure_definitions',
      },
      {
        name: 'قواعد الهيكل',
        href: '/organization/structure-rules',
        description: 'إدارة قواعد صلاحيات الهيكل',
        capability: 'manage_structure_rules',
      },
    ],
  },
];

export default function OrganizationPage() {
  return (
    <OrganizationAccessGuard>
      <OrganizationSections />
    </OrganizationAccessGuard>
  );
}

function OrganizationSections() {
  const permissions = usePermissions();

  // Every card is gated by its own capability: a delegated manager sees only
  // the pages their role actually allows, not the whole administration area.
  const visibleSections = organizationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => permissions.can(item.capability)),
    }))
    .filter((section) => section.items.length > 0);

  if (visibleSections.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        {uiLabels.permissionDenied}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="إدارة الهيكل التنظيمي" subtitle="إدارة الهيكل المؤسسي، المناصب، الأدوار، والتخصيصات" />

      <div className="mt-6 space-y-8">
        {visibleSections.map((section) => (
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
