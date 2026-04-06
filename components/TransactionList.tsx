'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Transaction, TransactionStatus, TransactionPriority } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';
import { uiLabels, transactionStatusLabels, priorityLabels } from '@/lib/ui-ar';

interface TransactionListProps {
  showArchived?: boolean;
}

export function TransactionList({ showArchived = false }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TransactionPriority | ''>('');
  const [transactionType, setTransactionType] = useState('');
  const [createdAtFrom, setCreatedAtFrom] = useState('');
  const [createdAtTo, setCreatedAtTo] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await transactionsWorkspaceService.getTransactions({
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
      });

      setTransactions(response.results);
      setTotalCount(response.count);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Transaction load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [currentPage, statusFilter, priorityFilter, showArchived]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTransactions();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setTransactionType('');
    setCreatedAtFrom('');
    setCreatedAtTo('');
    setDueDateFrom('');
    setDueDateTo('');
    setCurrentPage(1);
  };

  const hasFilters = searchQuery || statusFilter || priorityFilter || transactionType || 
                     createdAtFrom || createdAtTo || dueDateFrom || dueDateTo;

  if (isLoading && transactions.length === 0) {
    return <LoadingState message="جارٍ تحميل المعاملات..." />;
  }

  if (error && transactions.length === 0) {
    return (
      <ErrorState
        title="فشل تحميل المعاملات"
        message={error}
        onRetry={loadTransactions}
      />
    );
  }

  const statusOptions: TransactionStatus[] = ['draft', 'submitted', 'in_progress', 'pending', 'completed', 'cancelled'];
  const priorityOptions: TransactionPriority[] = ['low', 'normal', 'high', 'urgent'];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث في المعاملات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | '')}
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
                onChange={(e) => setPriorityFilter(e.target.value as TransactionPriority | '')}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">جميع الأولويات</option>
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabels[p] || p}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                بحث
              </button>
            </div>
          </div>
          
          {/* Date Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">تاريخ الإنشاء من</label>
              <input
                type="date"
                value={createdAtFrom}
                onChange={(e) => setCreatedAtFrom(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">تاريخ الإنشاء إلى</label>
              <input
                type="date"
                value={createdAtTo}
                onChange={(e) => setCreatedAtTo(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">تاريخ الاستحقاق من</label>
              <input
                type="date"
                value={dueDateFrom}
                onChange={(e) => setDueDateFrom(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">تاريخ الاستحقاق إلى</label>
              <input
                type="date"
                value={dueDateTo}
                onChange={(e) => setDueDateTo(e.target.value)}
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
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                مسح التصفية
              </button>
            </div>
          )}
        </form>
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

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <div className="text-sm text-slate-600">
              عرض {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalCount)} من {totalCount}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * 20 >= totalCount}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
