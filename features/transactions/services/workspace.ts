import {
  Transaction,
  RoutingAction,
  ApprovalAction,
  IncomingRegistry,
  OutgoingRegistry,
  PrintDispatch,
  Attachment,
  AuditLog,
  PaginatedResponse,
  TransactionStatus,
  TransactionPriority,
} from '@/types';
import { api } from '@/services/api';

export interface TransactionWorkspaceData {
  transaction: Transaction;
  routingHistory: PaginatedResponse<RoutingAction>;
  approvalHistory: PaginatedResponse<ApprovalAction>;
  incomingRegistry: IncomingRegistry | null;
  outgoingRegistry: OutgoingRegistry | null;
  printDispatch: PrintDispatch | null;
  attachments: PaginatedResponse<Attachment>;
  auditHistory: PaginatedResponse<AuditLog>;
  auditAccessDenied: boolean;
}

export interface TransactionListFilters {
  pageUrl?: string;
  search?: string;
  status?: TransactionStatus;
  priority?: TransactionPriority;
  transactionType?: string;
  isArchived?: boolean;
  createdAtFrom?: string;
  createdAtTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  signal?: AbortSignal;
}

class TransactionsWorkspaceService {
  async getTransactionDetail(id: string, signal?: AbortSignal): Promise<Transaction> {
    return api.get<Transaction>(`/transactions/${id}/`, undefined, { signal });
  }

  async getRoutingHistory(
    transactionId: string,
    options: { page?: number; signal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<RoutingAction>> {
    return api.get<PaginatedResponse<RoutingAction>>(
      `/transactions/${transactionId}/routing-history/`,
      options.page ? { page: options.page } : undefined,
      { signal: options.signal }
    );
  }

  async getApprovalHistory(
    transactionId: string,
    options: { page?: number; signal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<ApprovalAction>> {
    return api.get<PaginatedResponse<ApprovalAction>>(
      `/transactions/${transactionId}/approval-history/`,
      options.page ? { page: options.page } : undefined,
      { signal: options.signal }
    );
  }

  async getIncomingRegistry(transactionId: string): Promise<IncomingRegistry | null> {
    try {
      const response = await api.get<IncomingRegistry | null>(
        `/transactions/${transactionId}/incoming-registry/`
      );
      return response;
    } catch (error: unknown) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) {
        return null;
      }
      console.error('Failed to load incoming registry:', error);
      return null;
    }
  }

  async getOutgoingRegistry(transactionId: string): Promise<OutgoingRegistry | null> {
    try {
      const response = await api.get<OutgoingRegistry | null>(
        `/transactions/${transactionId}/outgoing-registry/`
      );
      return response;
    } catch (error: unknown) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) {
        return null;
      }
      console.error('Failed to load outgoing registry:', error);
      return null;
    }
  }

  async getPrintDispatch(transactionId: string): Promise<PrintDispatch | null> {
    try {
      const response = await api.get<PrintDispatch | null>(
        `/transactions/${transactionId}/print-dispatch/`
      );
      return response;
    } catch (error: unknown) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) {
        return null;
      }
      console.error('Failed to load print/dispatch:', error);
      return null;
    }
  }

  async getAttachments(
    transactionId: string,
    options: { page?: number; signal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<Attachment>> {
    return api.get<PaginatedResponse<Attachment>>(
      `/transactions/${transactionId}/attachments/`,
      options.page ? { page: options.page } : undefined,
      { signal: options.signal }
    );
  }

  async getAuditHistory(
    transactionId: string,
    options: { page?: number; signal?: AbortSignal } = {}
  ): Promise<{ page: PaginatedResponse<AuditLog>; accessDenied: boolean }> {
    try {
      const response = await api.get<PaginatedResponse<AuditLog>>(
        `/transactions/${transactionId}/audit-history/`,
        options.page ? { page: options.page } : undefined,
        { signal: options.signal }
      );
      return { page: response, accessDenied: false };
    } catch (error: unknown) {
      const apiError = error as { status?: number };
      if (apiError.status === 403) {
        return {
          page: { count: 0, next: null, previous: null, results: [] },
          accessDenied: true,
        };
      }
      throw error;
    }
  }

  async loadFullWorkspace(transactionId: string): Promise<TransactionWorkspaceData> {
    const transaction = await this.getTransactionDetail(transactionId);

    const [
      routingHistory,
      approvalHistory,
      incomingRegistry,
      outgoingRegistry,
      printDispatch,
      attachments,
      auditResult,
    ] = await Promise.all([
      this.getRoutingHistory(transactionId),
      this.getApprovalHistory(transactionId),
      this.getIncomingRegistry(transactionId),
      this.getOutgoingRegistry(transactionId),
      this.getPrintDispatch(transactionId),
      this.getAttachments(transactionId),
      this.getAuditHistory(transactionId),
    ]);

    return {
      transaction,
      routingHistory,
      approvalHistory,
      incomingRegistry,
      outgoingRegistry,
      printDispatch,
      attachments,
      auditHistory: auditResult.page,
      auditAccessDenied: auditResult.accessDenied,
    };
  }

  async getTransactions(filters: TransactionListFilters): Promise<PaginatedResponse<Transaction>> {
    if (filters.pageUrl) {
      return api.get<PaginatedResponse<Transaction>>(filters.pageUrl, undefined, {
        signal: filters.signal,
      });
    }

    const params: Record<string, string> = {};
    
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.transactionType) params.transaction_type = filters.transactionType;
    if (filters.createdAtFrom) params.created_at_from = filters.createdAtFrom;
    if (filters.createdAtTo) params.created_at_to = filters.createdAtTo;
    if (filters.dueDateFrom) params.due_date_from = filters.dueDateFrom;
    if (filters.dueDateTo) params.due_date_to = filters.dueDateTo;
    if (filters.page) params.page = filters.page.toString();

    const endpoint = filters.isArchived ? '/transactions/archive/' : '/transactions/';
    return api.get<PaginatedResponse<Transaction>>(endpoint, params, {
      signal: filters.signal,
    });
  }
}

export const transactionsWorkspaceService = new TransactionsWorkspaceService();
