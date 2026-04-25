import { z, type ZodType } from 'zod';

import { BACKEND_BASE_URL, API_BASE_URL } from '@/lib/env';
import { AuthRefreshSchema, AuthTokensSchema, CurrentUserSchema } from '@/lib/schemas';
import type { AuthTokens, CurrentUser, LoginCredentials } from '@/types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const DEFAULT_TIMEOUT_MS = 15000;
const MEDIA_FIELD_KEYS = new Set(['logo', 'profile_image']);

type QueryValue = string | number | boolean | null | undefined;

interface ApiRequestOptions<T = unknown> extends Omit<RequestInit, 'body' | 'signal'> {
  params?: Record<string, QueryValue>;
  body?: BodyInit | null;
  json?: unknown;
  schema?: ZodType<T>;
  signal?: AbortSignal;
  timeoutMs?: number;
  responseType?: 'json' | 'blob' | 'text';
  skipAuthRefresh?: boolean;
}

export interface DownloadedBlob {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
}

export class ApiError extends Error {
  status: number;
  detail?: string;
  fields?: Record<string, string[]>;
  data?: unknown;
  retryAfter?: number | null;
  aborted?: boolean;

  constructor(options: {
    message: string;
    status: number;
    detail?: string;
    fields?: Record<string, string[]>;
    data?: unknown;
    retryAfter?: number | null;
    aborted?: boolean;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.detail = options.detail;
    this.fields = options.fields;
    this.data = options.data;
    this.retryAfter = options.retryAfter;
    this.aborted = options.aborted;
  }
}

function isLocalhostRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (/^(data|blob):/i.test(url)) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsedUrl = new URL(url);
      if (['127.0.0.1', 'localhost'].includes(parsedUrl.hostname) && !isLocalhostRuntime()) {
        return `${BACKEND_BASE_URL}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      return url;
    }

    return url;
  }

  return `${BACKEND_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

function normalizeApiData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeApiData(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => {
        if (MEDIA_FIELD_KEYS.has(key) && (typeof item === 'string' || item == null)) {
          return [key, resolveAssetUrl(item as string | null | undefined)];
        }

        return [key, normalizeApiData(item)];
      })
    ) as T;
  }

  return value;
}

function getStoredTokens(): { access: string | null; refresh: string | null } {
  if (typeof window === 'undefined') {
    return { access: null, refresh: null };
  }

  return {
    access: localStorage.getItem(ACCESS_TOKEN_KEY),
    refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

function setStoredTokens(tokens: Partial<AuthTokens>) {
  if (typeof window === 'undefined') {
    return;
  }

  if (tokens.access !== undefined) {
    if (tokens.access) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  if (tokens.refresh !== undefined) {
    if (tokens.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

function clearStoredTokens() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function buildUrl(endpoint: string, params?: Record<string, QueryValue>) {
  const path = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (!params) {
    return path;
  }

  const url = new URL(path, typeof window === 'undefined' ? API_BASE_URL : window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return endpoint.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`;
}

function parseRetryAfter(headerValue: string | null): number | null {
  if (!headerValue) {
    return null;
  }

  const seconds = Number(headerValue);
  if (Number.isFinite(seconds)) {
    return seconds;
  }

  const dateMs = Date.parse(headerValue);
  if (Number.isNaN(dateMs)) {
    return null;
  }

  return Math.max(0, Math.ceil((dateMs - Date.now()) / 1000));
}

function extractFilename(disposition: string | null): string | null {
  if (!disposition) {
    return null;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] ?? null;
}

async function parseResponseBody(response: Response, responseType: 'json' | 'blob' | 'text') {
  if (response.status === 204) {
    return null;
  }

  if (responseType === 'blob') {
    return response.blob();
  }

  if (responseType === 'text') {
    return response.text();
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    return text ? { detail: text } : null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function buildApiError(response: Response, data: unknown): ApiError {
  const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;
  const detail = typeof record?.detail === 'string' ? record.detail : undefined;
  const fields = record
    ? Object.fromEntries(
        Object.entries(record).filter(([key, value]) => key !== 'detail' && Array.isArray(value)) as Array<
          [string, string[]]
        >
      )
    : undefined;

  return new ApiError({
    message: detail || response.statusText || `HTTP ${response.status}`,
    status: response.status,
    detail,
    fields: fields && Object.keys(fields).length > 0 ? fields : undefined,
    data,
    retryAfter,
  });
}

function mergeSignals(signal: AbortSignal | undefined, controller: AbortController) {
  if (!signal) {
    return () => undefined;
  }

  if (signal.aborted) {
    controller.abort(signal.reason);
    return () => undefined;
  }

  const abort = () => controller.abort(signal.reason);
  signal.addEventListener('abort', abort);
  return () => signal.removeEventListener('abort', abort);
}

class ApiClient {
  private refreshPromise: Promise<string | null> | null = null;
  private authFailureHandler: (() => void) | null = null;

  setAuthFailureHandler(handler: (() => void) | null) {
    this.authFailureHandler = handler;
  }

  private async performFetch<T>(endpoint: string, options: ApiRequestOptions<T>, hasRetriedAuth = false): Promise<T> {
    const controller = new AbortController();
    const detachSignal = mergeSignals(options.signal, controller);
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timeoutId = window.setTimeout(() => controller.abort('timeout'), timeoutMs);

    try {
      const headers = new Headers(options.headers ?? undefined);
      const accessToken = getStoredTokens().access;

      if (accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      let body = options.body;
      if (options.json !== undefined) {
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(options.json);
      }

      const url = buildUrl(endpoint, options.params);
      const response = await fetch(endpoint.startsWith('http') ? url : `${API_BASE_URL}${url}`, {
        ...options,
        headers,
        body,
        signal: controller.signal,
      });

      if (
        response.status === 401 &&
        !options.skipAuthRefresh &&
        !hasRetriedAuth &&
        !endpoint.startsWith('/auth/login/') &&
        !endpoint.startsWith('/auth/refresh/')
      ) {
        const refreshedToken = await this.refreshAccessToken();
        if (refreshedToken) {
          return this.performFetch(endpoint, options, true);
        }

        this.handleForcedLogout();
      }

      const responseType = options.responseType ?? 'json';
      const parsedBody = await parseResponseBody(response, responseType);

      if (!response.ok) {
        throw buildApiError(response, parsedBody);
      }

      if (responseType === 'blob') {
        const blob = parsedBody as Blob;
        return {
          blob,
          filename: extractFilename(response.headers.get('Content-Disposition')),
          contentType: response.headers.get('content-type'),
        } as T;
      }

      const normalized = normalizeApiData(parsedBody) as T;
      return options.schema ? options.schema.parse(normalized) : normalized;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new ApiError({
          message: 'Response validation failed',
          status: 500,
          detail: error.message,
          data: error.flatten(),
        });
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError({
          message: controller.signal.reason === 'timeout' ? 'Request timed out' : 'Request was cancelled',
          status: controller.signal.reason === 'timeout' ? 408 : 0,
          aborted: true,
        });
      }

      throw new ApiError({
        message: 'Network error',
        status: 0,
        data: error,
      });
    } finally {
      window.clearTimeout(timeoutId);
      detachSignal();
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const { refresh } = getStoredTokens();
      if (!refresh) {
        clearStoredTokens();
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        clearStoredTokens();
        return null;
      }

      const data = AuthRefreshSchema.parse(await parseResponseBody(response, 'json'));
      setStoredTokens({ access: data.access });
      return data.access;
    })().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private handleForcedLogout() {
    clearStoredTokens();
    this.authFailureHandler?.();
  }

  async get<T>(endpoint: string, params?: Record<string, QueryValue>, options: Omit<ApiRequestOptions<T>, 'params' | 'method'> = {}): Promise<T> {
    return this.performFetch(endpoint, {
      ...options,
      method: 'GET',
      params,
    });
  }

  async post<T>(endpoint: string, data?: unknown, options: Omit<ApiRequestOptions<T>, 'json' | 'method'> = {}): Promise<T> {
    return this.performFetch(endpoint, {
      ...options,
      method: 'POST',
      json: data,
    });
  }

  async patch<T>(endpoint: string, data: unknown, options: Omit<ApiRequestOptions<T>, 'json' | 'method'> = {}): Promise<T> {
    return this.performFetch(endpoint, {
      ...options,
      method: 'PATCH',
      json: data,
    });
  }

  async put<T>(endpoint: string, data: unknown, options: Omit<ApiRequestOptions<T>, 'json' | 'method'> = {}): Promise<T> {
    return this.performFetch(endpoint, {
      ...options,
      method: 'PUT',
      json: data,
    });
  }

  async delete<T>(endpoint: string, options: Omit<ApiRequestOptions<T>, 'method'> = {}): Promise<T> {
    return this.performFetch(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  async multipart<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PATCH' | 'PUT' = 'POST',
    options: Omit<ApiRequestOptions<T>, 'body' | 'method'> = {}
  ): Promise<T> {
    return this.performFetch(endpoint, {
      ...options,
      method,
      body: formData,
    });
  }

  async upload<T>(endpoint: string, formData: FormData, options: Omit<ApiRequestOptions<T>, 'body' | 'method'> = {}): Promise<T> {
    return this.multipart(endpoint, formData, 'POST', options);
  }

  async downloadBlob(endpoint: string, options: Omit<ApiRequestOptions<DownloadedBlob>, 'method' | 'responseType'> = {}): Promise<DownloadedBlob> {
    return this.performFetch(endpoint, {
      ...options,
      method: 'GET',
      responseType: 'blob',
    });
  }
}

export const api = new ApiClient();

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post('/auth/login/', credentials, {
      skipAuthRefresh: true,
      schema: AuthTokensSchema,
    });

    setStoredTokens(response);
    return response;
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await api.post('/auth/refresh/', { refresh: refreshToken }, {
      skipAuthRefresh: true,
      schema: AuthRefreshSchema,
    });

    setStoredTokens({ access: response.access });
    return response;
  },

  async getCurrentUser(): Promise<CurrentUser> {
    return api.get('/auth/me/', undefined, {
      schema: CurrentUserSchema,
    });
  },

  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    user_category?: CurrentUser['user_category'];
    profile_image?: File | null;
  }): Promise<CurrentUser> {
    if (data.profile_image !== undefined) {
      const formData = new FormData();
      if (data.first_name !== undefined) formData.append('first_name', data.first_name);
      if (data.last_name !== undefined) formData.append('last_name', data.last_name);
      if (data.user_category) formData.append('user_category', data.user_category);
      if (data.profile_image instanceof File) {
        formData.append('profile_image', data.profile_image);
      }

      return api.multipart('/auth/me/', formData, 'PATCH', {
        schema: CurrentUserSchema,
      });
    }

    return api.patch('/auth/me/', {
      ...(data.first_name !== undefined && { first_name: data.first_name }),
      ...(data.last_name !== undefined && { last_name: data.last_name }),
      ...(data.user_category !== undefined && { user_category: data.user_category }),
    }, {
      schema: CurrentUserSchema,
    });
  },

  logout(): void {
    clearStoredTokens();
  },

  getStoredTokens,

  isAuthenticated(): boolean {
    return !!getStoredTokens().access;
  },
};
