import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TransactionList } from '@/components/TransactionList';

const { replaceMock, getTransactions } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  getTransactions: vi.fn().mockResolvedValue({
    count: 1,
    next: null,
    previous: 'prev',
    results: [
      {
        id: 'tx-1',
        institution: 'inst-1',
        institution_name: 'Workflow College',
        transaction_type: 'type-1',
        transaction_type_name: 'معاملة داخلية',
        transaction_type_code: 'INT',
        title: 'طلب شراء',
        subject: 'أجهزة مكتبية',
        description: null,
        source_type: 'internal',
        status: 'in_progress',
        priority: 'high',
        confidentiality: 'normal',
        created_by: 'user-1',
        created_by_email: 'user@example.com',
        created_assignment: null,
        created_unit: null,
        current_assignment: null,
        current_unit: null,
        requires_response: false,
        due_date: null,
        is_print_ready: false,
        is_archived: false,
        external_reference: null,
        notes: null,
        is_active: true,
        created_at: '2026-04-25T00:00:00Z',
        updated_at: '2026-04-25T00:00:00Z',
      },
    ],
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/transactions',
  useSearchParams: () => new URLSearchParams('search=مذكرة&status=in_progress&page=2&priority=high'),
}));

vi.mock('@/features/transactions/services/workspace', () => ({
  transactionsWorkspaceService: {
    getTransactions,
  },
}));

describe('TransactionList', () => {
  it('reads filters from URL params and renders paginated results', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <TransactionList />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(getTransactions).toHaveBeenCalled());
    expect(getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'مذكرة',
        status: 'in_progress',
        priority: 'high',
        page: 2,
      }),
    );
    expect(await screen.findByText('طلب شراء')).toBeInTheDocument();
  });
});