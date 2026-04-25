import { expect, test } from '@playwright/test';

const currentUser = {
  id: 'user-1',
  email: 'user@example.com',
  first_name: 'Alya',
  last_name: 'User',
  is_active: true,
  is_staff: true,
  is_superuser: false,
  institution_name: 'Workflow College',
  access_summary: {
    can_create_transaction: true,
    can_route_transaction: true,
    can_approve_transaction: true,
    can_upload_attachment: true,
    can_view_attachment: true,
    can_view_reports: true,
  },
};

async function mockAuthenticatedSession(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'token');
    localStorage.setItem('refresh_token', 'refresh');
  });

  await page.route('**/api/auth/me/', (route) => route.fulfill({ json: currentUser }));
  await page.route('**/api/reports/transactions/summary/', (route) =>
    route.fulfill({ json: { counts: { total: 10, draft: 1, submitted: 1, in_progress: 3, pending: 1, completed: 3, cancelled: 0, archived: 1 }, by_institution: [] } }),
  );
  await page.route('**/api/reports/registry/summary/', (route) =>
    route.fulfill({ json: { counts: { total_incoming: 2, total_outgoing: 1, current_year_incoming: 2, current_year_outgoing: 1, year: 2026 }, incoming_by_institution: [], outgoing_by_institution: [] } }),
  );
  await page.route('**/api/reports/workflow/summary/', (route) =>
    route.fulfill({ json: { counts: { routing: 2, approval: 1, print_dispatch: 1, unread_notifications: 1 } } }),
  );
  await page.route('**/api/reports/my-summary/', (route) =>
    route.fulfill({ json: { counts: { my_created_transactions: 2, my_pending_routed_items: 1, my_unread_notifications: 1, my_recent_approvals: 1, my_recent_dispatch_related: 0 }, window_days: 30 } }),
  );
  await page.route('**/api/notifications/**', (route) =>
    route.fulfill({ json: { count: 1, next: null, previous: null, results: [{ id: 'n1', institution: 'i1', institution_name: 'Workflow College', recipient: 'u1', recipient_email: 'user@example.com', category: 'routing_received', title: 'إحالة جديدة', message: 'تمت إحالة معاملة إليك', related_transaction: 'tx-1', is_read: false, read_at: null, is_active: true, created_at: '2026-04-25T00:00:00Z', updated_at: '2026-04-25T00:00:00Z' }] } }),
  );
}

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('تسجيل الدخول إلى نظام ادارة المعاملات الادارية')).toBeVisible();
});

test('protected route redirects unauthenticated user', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?redirect=/);
});

test('dashboard renders after mocked login', async ({ page }) => {
  await mockAuthenticatedSession(page);
  await page.route('**/api/transactions/?page=1', (route) =>
    route.fulfill({ json: { count: 1, next: null, previous: null, results: [{ id: 'tx-1', institution: 'i1', institution_name: 'Workflow College', transaction_type: 't1', transaction_type_name: 'طلب', transaction_type_code: 'REQ', title: 'طلب شراء', subject: 'لوازم', description: null, source_type: 'internal', status: 'in_progress', priority: 'normal', confidentiality: 'normal', created_by: 'u1', created_by_email: 'user@example.com', created_assignment: null, created_unit: null, current_assignment: null, current_unit: null, requires_response: false, due_date: null, is_print_ready: false, is_archived: false, external_reference: null, notes: null, is_active: true, created_at: '2026-04-25T00:00:00Z', updated_at: '2026-04-25T00:00:00Z' }] } }),
  );

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'لوحة التحكم' })).toBeVisible();
  await expect(page.getByText('طلب شراء')).toBeVisible();
});

test('transactions list renders paginated data', async ({ page }) => {
  await mockAuthenticatedSession(page);
  await page.route('**/api/transactions/**', (route) =>
    route.fulfill({ json: { count: 2, next: 'http://127.0.0.1:8000/api/transactions/?page=2', previous: null, results: [{ id: 'tx-1', institution: 'i1', institution_name: 'Workflow College', transaction_type: 't1', transaction_type_name: 'طلب', transaction_type_code: 'REQ', title: 'معاملة أولى', subject: 'س1', description: null, source_type: 'internal', status: 'submitted', priority: 'normal', confidentiality: 'normal', created_by: 'u1', created_by_email: 'user@example.com', created_assignment: null, created_unit: null, current_assignment: null, current_unit: null, requires_response: false, due_date: null, is_print_ready: false, is_archived: false, external_reference: null, notes: null, is_active: true, created_at: '2026-04-25T00:00:00Z', updated_at: '2026-04-25T00:00:00Z' }] } }),
  );

  await page.goto('/transactions');
  await expect(page.getByText('معاملة أولى')).toBeVisible();
  await expect(page.getByText('الصفحة 1')).toBeVisible();
});