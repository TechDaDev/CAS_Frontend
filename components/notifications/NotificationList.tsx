'use client';

import { Notification } from '@/types';
import { NotificationItem } from './NotificationItem';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead?: (id: string) => void;
  expandedId?: string | null;
  onToggleExpand?: (id: string) => void;
  emptyMessage?: string;
}

export function NotificationList({ 
  notifications, 
  isLoading, 
  onMarkAsRead,
  expandedId,
  onToggleExpand,
  emptyMessage = 'لا توجد إشعارات'
}: NotificationListProps) {
  if (isLoading) {
    return <LoadingState message="جارٍ تحميل الإشعارات..." />;
  }

  if (notifications.length === 0) {
    return <EmptyState title="لا توجد إشعارات" message={emptyMessage} />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          isExpanded={expandedId === notification.id}
          onToggleExpand={() => onToggleExpand?.(notification.id)}
        />
      ))}
    </div>
  );
}
