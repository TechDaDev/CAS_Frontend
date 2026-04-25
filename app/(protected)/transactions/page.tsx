'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PageHeader } from '@/components/PageHeader';
import { TransactionList } from '@/components/TransactionList';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';

export default function TransactionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canCreateTransaction } = usePermissions();
  const showArchived = searchParams.get('archived') === 'true';

  const updateArchivedState = () => {
    const next = new URLSearchParams(searchParams.toString());
    if (showArchived) {
      next.delete('archived');
    } else {
      next.set('archived', 'true');
      next.set('page', '1');
    }

    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div>
      <PageHeader
        title={showArchived ? 'المعاملات المؤرشفة' : 'المعاملات'}
        subtitle={showArchived ? 'استعراض المعاملات المؤرشفة' : 'استعراض وإدارة المعاملات'}
        action={
          <div className="flex gap-2">
            <button
              onClick={updateArchivedState}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                showArchived
                  ? 'bg-slate-600 text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {showArchived ? 'عرض النشطة' : 'عرض المؤرشفة'}
            </button>
            {canCreateTransaction && (
              <Link
                href="/transactions/new"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                معاملة جديدة
              </Link>
            )}
          </div>
        }
      />

      <TransactionList showArchived={showArchived} />
    </div>
  );
}
