'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SummaryCard } from '@/components/SummaryCard';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { StatusBadge } from '@/components/StatusBadge';
import { reportsService, notificationsService, transactionsService } from '@/services/data';
import { uiLabels, notificationCategoryLabels } from '@/lib/ui-ar';
import { 
  TransactionSummaryReport, 
  RegistrySummaryReport, 
  WorkflowSummaryReport, 
  MySummaryReport,
  Notification,
  Transaction,
} from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummaryReport | null>(null);
  const [registrySummary, setRegistrySummary] = useState<RegistrySummaryReport | null>(null);
  const [workflowSummary, setWorkflowSummary] = useState<WorkflowSummaryReport | null>(null);
  const [mySummary, setMySummary] = useState<MySummaryReport | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          txSummary,
          regSummary,
          wfSummary,
          mySum,
          notifications,
          transactions,
        ] = await Promise.all([
          reportsService.getTransactionSummary(),
          reportsService.getRegistrySummary(),
          reportsService.getWorkflowSummary(),
          reportsService.getMySummary(),
          notificationsService.getNotifications({ is_read: false }),
          transactionsService.getTransactions({ page: 1 }),
        ]);

        setTransactionSummary(txSummary);
        setRegistrySummary(regSummary);
        setWorkflowSummary(wfSummary);
        setMySummary(mySum);
        setRecentNotifications(notifications.results.slice(0, 5));
        setRecentTransactions(transactions.results.slice(0, 5));
      } catch (err) {
        setError('فشل تحميل بيانات لوحة التحكم');
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل لوحة التحكم..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="فشل تحميل لوحة التحكم"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        subtitle="نظرة عامة على سير العمل والنشاط"
        action={
          <Link
            href="/transactions/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            معاملة جديدة
          </Link>
        }
      />

      {/* My Summary Section */}
      {mySummary && (
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
      )}

      {/* Transaction Summary Section */}
      {transactionSummary && (
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
      )}

      {/* Registry Summary Section */}
      {registrySummary && (
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
      )}

      {/* Workflow Summary Section */}
      {workflowSummary && (
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
      )}

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
            {recentNotifications.length === 0 ? (
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
            {recentTransactions.length === 0 ? (
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
