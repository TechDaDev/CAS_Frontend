import { Attachment, AttachmentCategory, PaginatedResponse } from '@/types';
import { api } from '@/services/api';

export interface CreateAttachmentPayload {
  institution: string;
  transaction: string;
  attachment_category?: string;
  routing_action?: string;
  approval_action?: string;
  file: File;
  description?: string;
  uploaded_assignment?: string;
  uploaded_unit?: string;
}

class AttachmentsService {
  async getAttachmentCategories(page = 1): Promise<PaginatedResponse<AttachmentCategory>> {
    return api.get<PaginatedResponse<AttachmentCategory>>('/transactions/attachment-categories/', { page });
  }

  async createAttachment(payload: CreateAttachmentPayload): Promise<Attachment> {
    const formData = new FormData();
    formData.append('institution', payload.institution);
    formData.append('transaction', payload.transaction);
    formData.append('file', payload.file);
    
    if (payload.attachment_category) {
      formData.append('attachment_category', payload.attachment_category);
    }
    if (payload.routing_action) {
      formData.append('routing_action', payload.routing_action);
    }
    if (payload.approval_action) {
      formData.append('approval_action', payload.approval_action);
    }
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.uploaded_assignment) {
      formData.append('uploaded_assignment', payload.uploaded_assignment);
    }
    if (payload.uploaded_unit) {
      formData.append('uploaded_unit', payload.uploaded_unit);
    }

    return api.upload<Attachment>('/transactions/attachments/', formData);
  }

  async downloadAttachment(id: string) {
    return api.downloadBlob(`/transactions/attachments/${id}/download/`);
  }
}

export const attachmentsService = new AttachmentsService();
