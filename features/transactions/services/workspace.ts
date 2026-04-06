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
  routingHistory: RoutingAction[];
  approvalHistory: ApprovalAction[];
  incomingRegistry: IncomingRegistry | null;
  outgoingRegistry: OutgoingRegistry | null;
  printDispatch: PrintDispatch | null;
  attachments: Attachment[];
  auditHistory: AuditLog[];
  auditAccessDenied: boolean;
}

export interface TransactionListFilters {
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
}

class TransactionsWorkspaceService {
  async getTransactionDetail(id: string): Promise<Transaction> {
    return api.get<Transaction>(`/transactions/${id}/`);
  }

  async getRoutingHistory(transactionId: string): Promise<RoutingAction[]> {
    try {
      const response = await api.get<PaginatedResponse<RoutingAction>>(
        `/transactions/${transactionId}/routing-history/`
      );
      return response.results;
    } catch (error) {
      console.error('Failed to load routing history:', error);
      return [];
    }
  }

  async getApprovalHistory(transactionId: string): Promise<ApprovalAction[]> {
    try {
      const response = await api.get<PaginatedResponse<ApprovalAction>>(
        `/transactions/${transactionId}/approval-history/`
      );
      return response.results;
    } catch (error) {
      console.error('Failed to load approval history:', error);
      return [];
    }
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

  async getAttachments(transactionId: string): Promise<Attachment[]> {
    try {
      const response = await api.get<PaginatedResponse<Attachment>>(
        `/transactions/${transactionId}/attachments/`
      );
      return response.results;
    } catch (error) {
      console.error('Failed to load attachments:', error);
      return [];
    }
  }

  async getAuditHistory(transactionId: string): Promise<{ logs: AuditLog[]; accessDenied: boolean }> {
    try {
      const response = await api.get<PaginatedResponse<AuditLog>>(
        `/transactions/${transactionId}/audit-history/`
      );
      return { logs: response.results, accessDenied: false };
    } catch (error: unknown) {
      const apiError = error as { status?: number };
      if (apiError.status === 403) {
        return { logs: [], accessDenied: true };
      }
      console.error('Failed to load audit history:', error);
      return { logs: [], accessDenied: false };
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
      auditHistory: auditResult.logs,
      auditAccessDenied: auditResult.accessDenied,
    };
  }

  async getTransactions(filters: TransactionListFilters): Promise<PaginatedResponse<Transaction>> {
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
    return api.get<PaginatedResponse<Transaction>>(endpoint, params);
  }
}

export const transactionsWorkspaceService = new TransactionsWorkspaceService();
