'use client';

import { useState } from 'react';
import { Notification } from '@/types';
import Link from 'next/link';
import { notificationCategoryLabels, uiLabels } from '@/lib/ui-ar';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead,
  isExpanded,
  onToggleExpand
}: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.is_read);

  const handleMarkAsRead = async () => {
    if (!isRead && onMarkAsRead) {
      await onMarkAsRead(notification.id);
      setIsRead(true);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'routing_received':
        return 'bg-blue-100 text-blue-800';
      case 'routing_returned':
        return 'bg-orange-100 text-orange-800';
      case 'approval_required':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'registry_incoming':
        return 'bg-purple-100 text-purple-800';
      case 'dispatch_stage':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCategory = (category: string) => {
    return notificationCategoryLabels[category] || category;
  };

  return (
    <div 
      className={`rounded-lg border p-4 transition-all ${
        isRead 
          ? 'border-slate-200 bg-white' 
          : 'border-blue-300 bg-blue-50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!isRead && (
              <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
            )}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(notification.category)}`}>
              {formatCategory(notification.category)}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(notification.created_at).toLocaleString('ar-SA')}
            </span>
          </div>
          
          <h4 className={`font-medium ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
            {notification.title}
          </h4>
          
          {isExpanded && (
            <p className="mt-2 text-sm text-slate-600">
              {notification.message}
            </p>
          )}
          
          <div className="mt-2 flex items-center gap-3">
            {notification.related_transaction && (
              <Link 
                href={`/transactions/${notification.related_transaction}`}
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={handleMarkAsRead}
              >
                عرض المعاملة ←
              </Link>
            )}
            
            {!isRead && onMarkAsRead && (
              <button
                onClick={handleMarkAsRead}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                تحديد كمقروء
              </button>
            )}
            
            <button
              onClick={onToggleExpand}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
