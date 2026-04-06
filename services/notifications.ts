import { api } from '@/services/api';
import { Notification, PaginatedResponse } from '@/types';

export interface NotificationFilters {
  isRead?: boolean;
  category?: string;
  isActive?: boolean;
  page?: number;
}

export const notificationsService = {
  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const params: Record<string, string> = {};
    if (filters?.isRead !== undefined) params.is_read = String(filters.isRead);
    if (filters?.category) params.category = filters.category;
    if (filters?.isActive !== undefined) params.is_active = String(filters.isActive);
    if (filters?.page) params.page = String(filters.page);

    return api.get<PaginatedResponse<Notification>>('/notifications/', params);
  },

  async getNotification(id: string): Promise<Notification> {
    return api.get<Notification>(`/notifications/${id}/`);
  },

  async markAsRead(id: string): Promise<void> {
    return api.post<void>(`/notifications/${id}/mark-read/`, {});
  },

  async markAllAsRead(): Promise<void> {
    return api.post<void>('/notifications/mark-all-read/', {});
  },
};
