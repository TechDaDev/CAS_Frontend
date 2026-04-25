'use client';

import { useQueries } from '@tanstack/react-query';

import { PageHeader } from '@/components/PageHeader';
import { SummaryCard } from '@/components/SummaryCard';
import { StatusBadge } from '@/components/StatusBadge';
import { reportsService, notificationsService, transactionsService } from '@/services/data';
import { 
  TransactionSummaryReport, 
  RegistrySummaryReport, 
  WorkflowSummaryReport, 
  MySummaryReport,
  Notification,
  Transaction,
} from '@/types';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';

function DashboardSectionState({ message, isError = false }: { message: string; isError?: boolean }) {
  return (
    <div className={`rounded-lg border px-4 py-6 text-sm ${isError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-500'}`}>
      {message}
    </div>
  );
}

function DashboardSkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { canCreateTransaction } = usePermissions();
  const [transactionSummaryQuery, registrySummaryQuery, workflowSummaryQuery, mySummaryQuery, notificationsQuery, transactionsQuery] = useQueries({
    queries: [
      { queryKey: ['dashboard', 'transaction-summary'], queryFn: () => reportsService.getTransactionSummary(), staleTime: 60_000 },
      { queryKey: ['dashboard', 'registry-summary'], queryFn: () => reportsService.getRegistrySummary(), staleTime: 60_000 },
      { queryKey: ['dashboard', 'workflow-summary'], queryFn: () => reportsService.getWorkflowSummary(), staleTime: 60_000 },
      { queryKey: ['dashboard', 'my-summary'], queryFn: () => reportsService.getMySummary(), staleTime: 120_000 },
      { queryKey: ['dashboard', 'notifications'], queryFn: () => notificationsService.getNotifications({ is_read: false }), staleTime: 30_000 },
      { queryKey: ['dashboard', 'transactions'], queryFn: () => transactionsService.getTransactions({ page: 1 }), staleTime: 30_000 },
    ],
  });

  const transactionSummary = transactionSummaryQuery.data as TransactionSummaryReport | undefined;
  const registrySummary = registrySummaryQuery.data as RegistrySummaryReport | undefined;
  const workflowSummary = workflowSummaryQuery.data as WorkflowSummaryReport | undefined;
  const mySummary = mySummaryQuery.data as MySummaryReport | undefined;
  const recentNotifications = (notificationsQuery.data?.results.slice(0, 5) ?? []) as Notification[];
  const recentTransactions = (transactionsQuery.data?.results.slice(0, 5) ?? []) as Transaction[];

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        subtitle="نظرة عامة على سير العمل والنشاط"
        action={canCreateTransaction ? (
          <Link
            href="/transactions/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            معاملة جديدة
          </Link>
        ) : undefined}
      />

      {/* My Summary Section */}
      {mySummaryQuery.isLoading && !mySummary ? <DashboardSkeletonGrid count={4} /> : mySummary ? (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">نشاطي</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="معاملاتي"
              value={mySummary.counts.my_created_transactions}
              subtitle={`آخر ${mySummary.window_days} يوم`}
              variant="primary"
            />
            <SummaryCard
              title="بندريد الإجراء"
              value={mySummary.counts.my_pending_routed_items}
              subtitle="في انتظار الإجراء"
              variant="warning"
            />
            <SummaryCard
              title="الموافقات الأخيرة"
              value={mySummary.counts.my_recent_approvals}
              subtitle={`آخر ${mySummary.window_days} يوم`}
              variant="success"
            />
            <SummaryCard
              title="الإشعارات غير المقروءة"
              value={mySummary.counts.my_unread_notifications}
              subtitle="تحديثات جديدة"
              variant={mySummary.counts.my_unread_notifications > 0 ? 'danger' : 'default'}
            />
          </div>
        </div>
      ) : mySummaryQuery.error ? <DashboardSectionState isError message="تعذر تحميل ملخص نشاطي." /> : null}

      {/* Transaction Summary Section */}
      {transactionSummaryQuery.isLoading && !transactionSummary ? <DashboardSkeletonGrid count={6} /> : transactionSummary ? (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">نظرة عامة على المعاملات</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryCard
              title="الإجمالي"
              value={transactionSummary.counts.total}
            />
            <SummaryCard
              title="قيد الإجراء"
              value={transactionSummary.counts.in_progress}
              variant="primary"
            />
            <SummaryCard
              title="معلقة"
              value={transactionSummary.counts.pending}
              variant="warning"
            />
            <SummaryCard
              title="مكتملة"
              value={transactionSummary.counts.completed}
              variant="success"
            />
            <SummaryCard
              title="مسودة"
              value={transactionSummary.counts.draft}
              variant="default"
            />
            <SummaryCard
              title="مؤرشفة"
              value={transactionSummary.counts.archived}
              variant="default"
            />
          </div>
        </div>
      ) : transactionSummaryQuery.error ? <DashboardSectionState isError message="تعذر تحميل ملخص المعاملات." /> : null}

      {/* Registry Summary Section */}
      {registrySummaryQuery.isLoading && !registrySummary ? <DashboardSkeletonGrid count={4} /> : registrySummary ? (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">نشاط السجل ({registrySummary.counts.year})</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="إجمالي الوارد"
              value={registrySummary.counts.total_incoming}
              subtitle={`${registrySummary.counts.current_year_incoming} هذا العام`}
            />
            <SummaryCard
              title="إجمالي الصادر"
              value={registrySummary.counts.total_outgoing}
              subtitle={`${registrySummary.counts.current_year_outgoing} هذا العام`}
            />
            <SummaryCard
              title="وارد العام"
              value={registrySummary.counts.current_year_incoming}
              variant="primary"
            />
            <SummaryCard
              title="صادر العام"
              value={registrySummary.counts.current_year_outgoing}
              variant="primary"
            />
          </div>
        </div>
      ) : registrySummaryQuery.error ? <DashboardSectionState isError message="تعذر تحميل ملخص السجل." /> : null}

      {/* Workflow Summary Section */}
      {workflowSummaryQuery.isLoading && !workflowSummary ? <DashboardSkeletonGrid count={4} /> : workflowSummary ? (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">حالة سير العمل</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="إحالات نشطة"
              value={workflowSummary.counts.routing}
              variant="primary"
            />
            <SummaryCard
              title="موافقات معلقة"
              value={workflowSummary.counts.approval}
              variant="warning"
            />
            <SummaryCard
              title="طباعة/إرسال"
              value={workflowSummary.counts.print_dispatch}
              variant="default"
            />
            <SummaryCard
              title="إشعارات"
              value={workflowSummary.counts.unread_notifications}
              variant={workflowSummary.counts.unread_notifications > 0 ? 'danger' : 'default'}
            />
          </div>
        </div>
      ) : workflowSummaryQuery.error ? <DashboardSectionState isError message="تعذر تحميل ملخص سير العمل." /> : null}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Notifications */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="font-medium text-slate-900">الإشعارات الأخيرة</h3>
            <Link href="/notifications" className="text-sm text-blue-600 hover:text-blue-700">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {notificationsQuery.isLoading && !notificationsQuery.data ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">جارٍ تحميل الإشعارات...</div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                لا توجد إشعارات غير مقروءة
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div key={notification.id} className="px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                      <p className="text-sm text-slate-600">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status="unread" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="font-medium text-slate-900">المعاملات الأخيرة</h3>
            <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-700">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {transactionsQuery.isLoading && !transactionsQuery.data ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">جارٍ تحميل المعاملات...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                لا توجد معاملات
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/transactions/${transaction.id}`}
                  className="block px-4 py-3 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{transaction.title}</p>
                      <p className="text-sm text-slate-600">{transaction.subject}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-slate-500">{transaction.transaction_type_name}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={transaction.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
