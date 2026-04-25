'use client';

import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Transaction, TransactionStatus, TransactionPriority } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';
import { priorityLabels, transactionStatusLabels } from '@/lib/ui-ar';

interface TransactionListProps {
  showArchived?: boolean;
}

export function TransactionList({ showArchived = false }: TransactionListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

  const currentPage = Number(searchParams.get('page') ?? '1') || 1;
  const statusFilter = (searchParams.get('status') as TransactionStatus | null) ?? '';
  const priorityFilter = (searchParams.get('priority') as TransactionPriority | null) ?? '';
  const transactionType = searchParams.get('transaction_type') ?? '';
  const createdAtFrom = searchParams.get('created_at_from') ?? '';
  const createdAtTo = searchParams.get('created_at_to') ?? '';
  const dueDateFrom = searchParams.get('due_date_from') ?? '';
  const dueDateTo = searchParams.get('due_date_to') ?? '';
  const searchQuery = searchParams.get('search') ?? '';

  const hasFilters = Boolean(
    searchQuery || statusFilter || priorityFilter || transactionType || createdAtFrom || createdAtTo || dueDateFrom || dueDateTo
  );

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const replaceParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    if (!updates.page) {
      next.set('page', '1');
    }

    router.replace(`${pathname}?${next.toString()}`);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== searchQuery) {
        replaceParams({ search: searchInput || null, page: '1' });
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchQuery]);

  const queryKey = useMemo(
    () => [
      'transactions',
      showArchived,
      searchQuery,
      statusFilter,
      priorityFilter,
      transactionType,
      createdAtFrom,
      createdAtTo,
      dueDateFrom,
      dueDateTo,
      currentPage,
    ],
    [showArchived, searchQuery, statusFilter, priorityFilter, transactionType, createdAtFrom, createdAtTo, dueDateFrom, dueDateTo, currentPage]
  );

  const transactionsQuery = useQuery({
    queryKey,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      transactionsWorkspaceService.getTransactions({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        transactionType: transactionType || undefined,
        createdAtFrom: createdAtFrom || undefined,
        createdAtTo: createdAtTo || undefined,
        dueDateFrom: dueDateFrom || undefined,
        dueDateTo: dueDateTo || undefined,
        page: currentPage,
        isArchived: showArchived,
        signal,
      }),
  });

  if (transactionsQuery.isLoading && !transactionsQuery.data) {
    return <LoadingState message="جارٍ تحميل المعاملات..." />;
  }

  if (transactionsQuery.error && !transactionsQuery.data) {
    return (
      <ErrorState
        title="فشل تحميل المعاملات"
        message="تعذر تحميل قائمة المعاملات. حاول مرة أخرى."
        onRetry={() => transactionsQuery.refetch()}
      />
    );
  }

  const transactions = transactionsQuery.data?.results ?? [];
  const totalCount = transactionsQuery.data?.count ?? 0;
  const hasNextPage = Boolean(transactionsQuery.data?.next);
  const hasPreviousPage = Boolean(transactionsQuery.data?.previous);

  const statusOptions: TransactionStatus[] = ['draft', 'submitted', 'in_progress', 'pending', 'completed', 'cancelled'];
  const priorityOptions: TransactionPriority[] = ['low', 'normal', 'high', 'urgent'];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث في المعاملات..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => replaceParams({ status: e.target.value || null })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">جميع الحالات</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {transactionStatusLabels[s] || s}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => replaceParams({ priority: e.target.value || null })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">جميع الأولويات</option>
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabels[p] || p}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={transactionType}
                onChange={(e) => replaceParams({ transaction_type: e.target.value || null })}
                placeholder="نوع المعاملة"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Date Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">تاريخ الإنشاء من</label>
              <input
                type="date"
                value={createdAtFrom}
                onChange={(e) => replaceParams({ created_at_from: e.target.value || null })}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">تاريخ الإنشاء إلى</label>
              <input
                type="date"
                value={createdAtTo}
                onChange={(e) => replaceParams({ created_at_to: e.target.value || null })}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">تاريخ الاستحقاق من</label>
              <input
                type="date"
                value={dueDateFrom}
                onChange={(e) => replaceParams({ due_date_from: e.target.value || null })}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">تاريخ الاستحقاق إلى</label>
              <input
                type="date"
                value={dueDateTo}
                onChange={(e) => replaceParams({ due_date_to: e.target.value || null })}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {hasFilters && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-600">
                {totalCount} نتيجة
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  const next = new URLSearchParams(searchParams.toString());
                  ['search', 'status', 'priority', 'transaction_type', 'created_at_from', 'created_at_to', 'due_date_from', 'due_date_to', 'page'].forEach((key) => next.delete(key));
                  router.replace(`${pathname}?${next.toString()}`);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                مسح التصفية
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {transactions.length === 0 ? (
          <EmptyState
            title="لا توجد معاملات"
            message={hasFilters ? "حاول تعديل البحث أو التصفية" : "لا توجد معاملات متاحة"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    المعاملة
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    الأولوية
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{transaction.title}</p>
                        <p className="text-sm text-slate-600">{transaction.subject}</p>
                        {transaction.institution_name && (
                          <p className="text-xs text-slate-500">{transaction.institution_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      {transaction.transaction_type_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.priority} variant="priority" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link
                        href={`/transactions/${transaction.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <PaginationControls
        currentPage={currentPage}
        totalItems={totalCount}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={(page) => replaceParams({ page: String(page) })}
        isLoading={transactionsQuery.isFetching}
      />
    </div>
  );
}
