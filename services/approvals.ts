import { ApprovalAction, DecisionType, SignatureMethod, SignatureStatus } from '@/types';
import { api } from '@/services/api';

export interface CreateApprovalActionPayload {
  institution: string;
  transaction: string;
  routing_action?: string;
  acted_assignment: string;
  decision: DecisionType;
  decision_note?: string;
  signature_method: SignatureMethod;
  signature_status: SignatureStatus;
}

class ApprovalsService {
  async createApprovalAction(payload: CreateApprovalActionPayload): Promise<ApprovalAction> {
    return api.post<ApprovalAction>('/approvals/actions/', payload);
  }
}

export const approvalsService = new ApprovalsService();
