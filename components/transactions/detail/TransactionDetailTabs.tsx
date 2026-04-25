'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

type TabId = 'overview' | 'routing' | 'approvals' | 'registry' | 'print-dispatch' | 'attachments' | 'audit';

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'routing', label: 'سجل الإحالات' },
  { id: 'approvals', label: 'سجل الموافقات' },
  { id: 'registry', label: 'السجل' },
  { id: 'print-dispatch', label: 'الطباعة والإرسال' },
  { id: 'attachments', label: 'المرفقات' },
  { id: 'audit', label: 'سجل التدقيق' },
];

interface TransactionDetailTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TransactionDetailTabs({ activeTab, onTabChange }: TransactionDetailTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabClick = (tabId: TabId) => {
    onTabChange(tabId);
    
    // Update URL with tab query param
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-6 border-b border-slate-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function getTabFromSearchParams(searchParams: { get: (key: string) => string | null }): TabId {
  const tab = searchParams.get('tab');
  const validTabs: TabId[] = ['overview', 'routing', 'approvals', 'registry', 'print-dispatch', 'attachments', 'audit'];
  return validTabs.includes(tab as TabId) ? (tab as TabId) : 'overview';
}

export type { TabId };
