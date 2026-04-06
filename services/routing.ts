import { RoutingAction, RouteType, TargetMode } from '@/types';
import { api } from '@/services/api';

export interface CreateRoutingActionPayload {
  institution: string;
  transaction: string;
  route_type: RouteType;
  target_mode: TargetMode;
  from_assignment?: string;
  from_unit?: string;
  to_user?: string;
  to_unit?: string;
  to_assignment?: string;
  to_committee?: string;
  margin_note?: string;
}

export interface MarkReceivedPayload {
  acted_assignment?: string;
}

export interface MarkCompletedPayload {
  acted_assignment?: string;
}

class RoutingService {
  async createRoutingAction(payload: CreateRoutingActionPayload): Promise<RoutingAction> {
    return api.post<RoutingAction>('/routing/actions/', payload);
  }

  async markReceived(actionId: string, payload?: MarkReceivedPayload): Promise<RoutingAction> {
    return api.post<RoutingAction>(`/routing/actions/${actionId}/mark-received/`, payload);
  }

  async markCompleted(actionId: string, payload?: MarkCompletedPayload): Promise<RoutingAction> {
    return api.post<RoutingAction>(`/routing/actions/${actionId}/mark-completed/`, payload);
  }
}

export const routingService = new RoutingService();
