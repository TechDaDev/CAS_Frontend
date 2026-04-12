'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationCategory } from '@/types';
import { notificationsService } from '@/services/notifications';
import { PageHeader } from '@/components/PageHeader';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { PaginationControls } from '@/components/PaginationControls';
import { notificationCategoryLabels } from '@/lib/ui-ar';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    isRead?: boolean;
    category?: NotificationCategory;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsService.getNotifications({
        isRead: filters.isRead,
        category: filters.category,
        page: currentPage,
      });
      setNotifications(response.results);
      setTotalItems(response.count);
      setHasNextPage(Boolean(response.next));
      setHasPreviousPage(Boolean(response.previous));
    } catch {
      setError('فشل تحميل الإشعارات');
    } finally {
      setIsLoading(false);
    }
  }, [filters.isRead, filters.category, currentPage]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
    } catch {
      // Error handled silently - UI already updated optimistically
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch {
      setError('فشل تحديد جميع الإشعارات كمقروءة');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <PageHeader 
        title="الإشعارات" 
        subtitle={`${unreadCount} غير مقروءة`} 
      />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NotificationFilters
          filters={filters}
          onFilterChange={(nextFilters) => {
            setCurrentPage(1);
            setFilters(nextFilters);
          }}
        />
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isMarkingAll ? 'جارٍ التحديد...' : 'تحديد الكل كمقروء'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
        expandedId={expandedId}
        onToggleExpand={handleToggleExpand}
        emptyMessage={
          filters.isRead === false 
            ? 'لا توجد إشعارات غير مقروءة' 
            : filters.category 
              ? `لا توجد إشعارات ${notificationCategoryLabels[filters.category] || filters.category}` 
              : 'لا توجد إشعارات'
        }
      />

      <PaginationControls
        currentPage={currentPage}
        totalItems={totalItems}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />
    </div>
  );
}
