import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AttachmentsTab } from '@/components/transactions/detail/tabs/AttachmentsTab';

const { getAttachments, downloadAttachment } = vi.hoisted(() => ({
  getAttachments: vi.fn().mockResolvedValue({
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 'att-1',
        institution: 'inst-1',
        institution_name: 'Workflow College',
        transaction: 'tx-1',
        transaction_title: 'Purchase Request',
        attachment_category: null,
        category_name: 'مذكرة',
        category_code: 'MEMO',
        file: null,
        original_filename: 'memo.pdf',
        file_size: 1024,
        mime_type: 'application/pdf',
        description: 'وصف',
        uploaded_by: 'user-1',
        uploaded_by_email: 'user@example.com',
        uploaded_assignment: null,
        uploaded_unit: null,
        uploaded_unit_name: null,
        is_active: true,
        created_at: '2026-04-25T00:00:00Z',
        updated_at: '2026-04-25T00:00:00Z',
        extraction_status: 'completed',
        extracted_at: '2026-04-25T01:00:00Z',
      },
    ],
  }),
  downloadAttachment: vi.fn().mockResolvedValue({
    blob: new Blob(['pdf']),
    filename: 'memo.pdf',
    contentType: 'application/pdf',
  }),
}));

vi.mock('@/features/transactions/services/workspace', () => ({
  transactionsWorkspaceService: {
    getAttachments,
  },
}));

vi.mock('@/services/attachments', () => ({
  attachmentsService: {
    downloadAttachment,
    getAttachmentCategories: vi.fn().mockResolvedValue({ count: 0, next: null, previous: null, results: [] }),
    createAttachment: vi.fn(),
  },
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    canViewAttachment: true,
    canUploadAttachment: false,
  }),
}));

vi.mock('@/components/workflow/AttachmentUploadPanel', () => ({
  AttachmentUploadPanel: () => <div>upload-panel</div>,
}));

describe('AttachmentsTab', () => {
  it('shows extraction status and uses the protected download endpoint', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AttachmentsTab transactionId="tx-1" institutionId="inst-1" />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('memo.pdf')).toBeInTheDocument();
    expect(screen.getByText('اكتمل الاستخراج')).toBeInTheDocument();

    fireEvent.click(screen.getByText('تنزيل محمي'));

    await waitFor(() => expect(downloadAttachment).toHaveBeenCalledWith('att-1'));
  });
});