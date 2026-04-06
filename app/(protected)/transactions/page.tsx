'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { TransactionList } from '@/components/TransactionList';
import Link from 'next/link';

export default function TransactionsPage() {
  const [showArchived, setShowArchived] = useState(false);

  return (
    <div>
      <PageHeader
        title={showArchived ? "Archived Transactions" : "Transactions"}
        subtitle={showArchived ? "View archived transaction records" : "Browse and manage all transactions"}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                showArchived
                  ? 'bg-slate-600 text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {showArchived ? 'View Active' : 'View Archived'}
            </button>
            <Link
              href="/transactions/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              New Transaction
            </Link>
          </div>
        }
      />

      <TransactionList showArchived={showArchived} />
    </div>
  );
}
