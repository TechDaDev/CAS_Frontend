import { IncomingRegistry, OutgoingRegistry, PrintDispatch } from '@/types';
import { api } from '@/services/api';

export interface CreateIncomingRegistryPayload {
  institution: string;
  transaction: string;
  registered_assignment: string;
  registered_unit: string;
  received_date: string;
  sender_name?: string;
  external_reference?: string;
  subject_snapshot?: string;
  notes?: string;
}

export interface CreateOutgoingRegistryPayload {
  institution: string;
  transaction: string;
  registered_assignment: string;
  registered_unit: string;
  sent_date: string;
  recipient_name?: string;
  external_reference?: string;
  subject_snapshot?: string;
  notes?: string;
}

export interface CreatePrintDispatchPayload {
  institution: string;
  transaction: string;
  outgoing_registry_entry?: string;
}

export interface PrintDispatchStagePayload {
  acted_assignment?: string;
  dispatch_reference?: string;
  dispatch_notes?: string;
}

class RegistryService {
  async createIncomingRegistry(payload: CreateIncomingRegistryPayload): Promise<IncomingRegistry> {
    return api.post<IncomingRegistry>('/registry/incoming/', payload);
  }

  async createOutgoingRegistry(payload: CreateOutgoingRegistryPayload): Promise<OutgoingRegistry> {
    return api.post<OutgoingRegistry>('/registry/outgoing/', payload);
  }

  async createPrintDispatch(payload: CreatePrintDispatchPayload): Promise<PrintDispatch> {
    return api.post<PrintDispatch>('/registry/print-dispatch/', payload);
  }

  async markReadyForPrint(id: string, payload?: PrintDispatchStagePayload): Promise<PrintDispatch> {
    return api.post<PrintDispatch>(`/registry/print-dispatch/${id}/mark-ready-for-print/`, payload);
  }

  async markPrepared(id: string, payload?: PrintDispatchStagePayload): Promise<PrintDispatch> {
    return api.post<PrintDispatch>(`/registry/print-dispatch/${id}/mark-prepared/`, payload);
  }

  async markPrinted(id: string, payload?: PrintDispatchStagePayload): Promise<PrintDispatch> {
    return api.post<PrintDispatch>(`/registry/print-dispatch/${id}/mark-printed/`, payload);
  }

  async markDeliveredForSignature(id: string, payload?: PrintDispatchStagePayload): Promise<PrintDispatch> {
    return api.post<PrintDispatch>(`/registry/print-dispatch/${id}/mark-delivered-for-signature/`, payload);
  }

  async markWetSigned(id: string, payload?: PrintDispatchStagePayload): Promise<PrintDispatch> {
    return api.post<PrintDispatch>(`/registry/print-dispatch/${id}/mark-wet-signed/`, payload);
  }

  async markDeliveredToRegistry(id: string, payload?: PrintDispatchStagePayload): Promise<PrintDispatch> {
    return api.post<PrintDispatch>(`/registry/print-dispatch/${id}/mark-delivered-to-registry/`, payload);
  }

  async markDispatched(id: string, payload?: PrintDispatchStagePayload): Promise<PrintDispatch> {
    return api.post<PrintDispatch>(`/registry/print-dispatch/${id}/mark-dispatched/`, payload);
  }
}

export const registryService = new RegistryService();
