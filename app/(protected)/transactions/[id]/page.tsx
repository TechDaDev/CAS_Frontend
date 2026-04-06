'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Transaction } from '@/types';
import { transactionsWorkspaceService } from '@/features/transactions/services/workspace';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { TransactionDetailHeader } from '@/components/transactions/detail/TransactionDetailHeader';
import { TransactionDetailTabs, TabId, getTabFromSearchParams } from '@/components/transactions/detail/TransactionDetailTabs';
import { OverviewTab } from '@/components/transactions/detail/tabs/OverviewTab';
import { RoutingHistoryTab } from '@/components/transactions/detail/tabs/RoutingHistoryTab';
import { ApprovalHistoryTab } from '@/components/transactions/detail/tabs/ApprovalHistoryTab';
import { RegistryTab } from '@/components/transactions/detail/tabs/RegistryTab';
import { PrintDispatchTab } from '@/components/transactions/detail/tabs/PrintDispatchTab';
import { AttachmentsTab } from '@/components/transactions/detail/tabs/AttachmentsTab';
import { AuditHistoryTab } from '@/components/transactions/detail/tabs/AuditHistoryTab';

export default function TransactionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const transactionId = params.id as string;
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>(() => getTabFromSearchParams(searchParams));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleWorkspaceUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const loadTransaction = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await transactionsWorkspaceService.getTransactionDetail(transactionId);
        setTransaction(data);
      } catch (err) {
        setError('فشل تحميل المعاملة');
      } finally {
        setIsLoading(false);
      }
    };
    loadTransaction();
  }, [transactionId, refreshKey]);

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromSearchParams(searchParams));
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingState message="جارٍ تحميل المعاملة..." />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <ErrorState
          title="خطأ"
          message={error || 'المعاملة غير موجودة'}
        />
      </div>
    );
  }

  return (
    <div>
      <TransactionDetailHeader transaction={transaction} onWorkspaceUpdate={handleWorkspaceUpdate} />
      
      <TransactionDetailTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab transaction={transaction} />}
        {activeTab === 'routing' && <RoutingHistoryTab transactionId={transactionId} />}
        {activeTab === 'approvals' && <ApprovalHistoryTab transactionId={transactionId} />}
        {activeTab === 'registry' && <RegistryTab transactionId={transactionId} />}
        {activeTab === 'print-dispatch' && <PrintDispatchTab transactionId={transactionId} institutionId={transaction.institution} />}
        {activeTab === 'attachments' && (
          <AttachmentsTab 
            transactionId={transactionId} 
            institutionId={transaction.institution}
            currentAssignmentId={transaction.current_assignment}
            currentUnitId={transaction.current_unit}
          />
        )}
        {activeTab === 'audit' && <AuditHistoryTab transactionId={transactionId} />}
      </div>
    </div>
  );
}
