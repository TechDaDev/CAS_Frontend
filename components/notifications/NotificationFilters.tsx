'use client';

import { NotificationCategory } from '@/types';
import { notificationCategoryLabels, uiLabels } from '@/lib/ui-ar';

interface NotificationFiltersProps {
  filters: {
    isRead?: boolean;
    category?: NotificationCategory;
  };
  onFilterChange: (filters: { isRead?: boolean; category?: NotificationCategory }) => void;
}

const categories: { value: NotificationCategory | ''; label: string }[] = [
  { value: '', label: 'جميع الفئات' },
  { value: 'routing_received', label: notificationCategoryLabels.routing_received },
  { value: 'routing_completed', label: notificationCategoryLabels.routing_completed },
  { value: 'approval_recorded', label: notificationCategoryLabels.approval_recorded },
  { value: 'registry_registered', label: notificationCategoryLabels.registry_registered },
  { value: 'dispatch_updated', label: notificationCategoryLabels.dispatch_updated },
  { value: 'attachment_uploaded', label: notificationCategoryLabels.attachment_uploaded },
  { value: 'general', label: notificationCategoryLabels.general },
];

export function NotificationFilters({ filters, onFilterChange }: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">الفئة:</label>
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ 
            ...filters, 
            category: e.target.value as NotificationCategory || undefined 
          })}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">الحالة:</label>
        <select
          value={filters.isRead === undefined ? '' : filters.isRead ? 'read' : 'unread'}
          onChange={(e) => {
            const value = e.target.value;
            onFilterChange({ 
              ...filters, 
              isRead: value === '' ? undefined : value === 'read' 
            });
          }}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">الكل</option>
          <option value="unread">غير مقروء فقط</option>
          <option value="read">مقروء فقط</option>
        </select>
      </div>

      <button
        onClick={() => onFilterChange({})}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        مسح التصفية
      </button>
    </div>
  );
}
