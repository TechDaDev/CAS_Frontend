import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, api, authService } from '@/services/api';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
}

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('attaches the access token', async () => {
    localStorage.setItem('access_token', 'token-123');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await api.get('/health/');

    const [, config] = fetchMock.mock.calls[0];
    expect(new Headers(config.headers).get('Authorization')).toBe('Bearer token-123');
  });

  it('refreshes once on 401 and retries the original request', async () => {
    localStorage.setItem('access_token', 'expired-token');
    localStorage.setItem('refresh_token', 'refresh-token');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ detail: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ access: 'fresh-token' }))
      .mockResolvedValueOnce(
        jsonResponse({
          id: '1',
          email: 'user@example.com',
          first_name: 'A',
          last_name: 'B',
          is_active: true,
          is_staff: true,
          is_superuser: false,
          institution_name: null,
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const user = await authService.getCurrentUser();

    expect(user.email).toBe('user@example.com');
    expect(localStorage.getItem('access_token')).toBe('fresh-token');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('surfaces retry-after for throttled responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ detail: 'Slow down' }, { status: 429, headers: { 'Retry-After': '7' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.get('/reports/my-summary/')).rejects.toMatchObject({
      status: 429,
      retryAfter: 7,
    });
  });

  it('downloads blobs through the protected endpoint helper', async () => {
    const blob = new Blob(['demo'], { type: 'application/pdf' });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="memo.pdf"',
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.downloadBlob('/transactions/attachments/1/download/');

    expect(result.filename).toBe('memo.pdf');
    expect(result.contentType).toBe('application/pdf');
  });

  it('parses field validation errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ title: ['هذا الحقل مطلوب'] }, { status: 400 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.post('/transactions/', {})).rejects.toMatchObject({
      status: 400,
      fields: { title: ['هذا الحقل مطلوب'] },
    });
  });
});