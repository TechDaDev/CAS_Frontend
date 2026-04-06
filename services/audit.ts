import { api } from '@/services/api';
import { AuditLog, PaginatedResponse } from '@/types';

export interface AuditLogFilters {
  action?: string;
  actor?: string;
  objectType?: string;
  relatedTransaction?: string;
  institution?: string;
  isActive?: boolean;
  page?: number;
}

export const auditService = {
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const params: Record<string, string> = {};
    if (filters?.action) params.action = filters.action;
    if (filters?.actor) params.actor = filters.actor;
    if (filters?.objectType) params.object_type = filters.objectType;
    if (filters?.relatedTransaction) params.related_transaction = filters.relatedTransaction;
    if (filters?.institution) params.institution = filters.institution;
    if (filters?.isActive !== undefined) params.is_active = String(filters.isActive);
    if (filters?.page) params.page = String(filters.page);

    return api.get<PaginatedResponse<AuditLog>>('/audit/logs/', params);
  },

  async getAuditLog(id: string): Promise<AuditLog> {
    return api.get<AuditLog>(`/audit/logs/${id}/`);
  },

  async getTransactionAuditHistory(transactionId: string): Promise<PaginatedResponse<AuditLog>> {
    return api.get<PaginatedResponse<AuditLog>>(`/transactions/${transactionId}/audit-history/`);
  },
};
