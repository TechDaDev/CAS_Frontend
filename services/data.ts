import {
  TransactionSummaryReport,
  RegistrySummaryReport,
  WorkflowSummaryReport,
  MySummaryReport,
  PaginatedResponse,
  Notification,
  Transaction,
} from '@/types';
import { api } from './api';

export const reportsService = {
  async getTransactionSummary(): Promise<TransactionSummaryReport> {
    return api.get<TransactionSummaryReport>('/reports/transactions/summary/');
  },

  async getRegistrySummary(): Promise<RegistrySummaryReport> {
    return api.get<RegistrySummaryReport>('/reports/registry/summary/');
  },

  async getWorkflowSummary(): Promise<WorkflowSummaryReport> {
    return api.get<WorkflowSummaryReport>('/reports/workflow/summary/');
  },

  async getMySummary(): Promise<MySummaryReport> {
    return api.get<MySummaryReport>('/reports/my-summary/');
  },
};

export const notificationsService = {
  async getNotifications(params?: { is_read?: boolean }): Promise<PaginatedResponse<Notification>> {
    const queryParams: Record<string, string> = {};
    if (params?.is_read !== undefined) {
      queryParams.is_read = params.is_read.toString();
    }
    return api.get<PaginatedResponse<Notification>>('/notifications/', queryParams);
  },

  async markAsRead(id: string): Promise<void> {
    return api.post(`/notifications/${id}/mark-read/`, undefined);
  },

  async markAllAsRead(): Promise<{ marked_read: number }> {
    return api.post('/notifications/mark-all-read/', undefined);
  },
};

export const transactionsService = {
  async getTransactions(params?: { 
    search?: string; 
    status?: string; 
    page?: number;
    is_archived?: boolean;
  }): Promise<PaginatedResponse<Transaction>> {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.status) queryParams.status = params.status;
    if (params?.page) queryParams.page = params.page.toString();
    
    const endpoint = params?.is_archived ? '/transactions/archive/' : '/transactions/';
    return api.get<PaginatedResponse<Transaction>>(endpoint, queryParams);
  },

  async getMyTransactions(params?: { page?: number }): Promise<PaginatedResponse<Transaction>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    return api.get<PaginatedResponse<Transaction>>('/transactions/my/', queryParams);
  },

  async getTransaction(id: string): Promise<Transaction> {
    return api.get<Transaction>(`/transactions/${id}/`);
  },
};
