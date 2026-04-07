import { AuthTokens, LoginCredentials, CurrentUser } from '@/types';

const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (isLocalhost ? 'http://127.0.0.1:8000/api' : 'https://corrarchivsystem.up.railway.app/api')
).replace(/\/+$/, '');

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
const MEDIA_FIELD_KEYS = new Set(['logo', 'profile_image', 'file']);

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
      if (['127.0.0.1', 'localhost'].includes(parsedUrl.hostname) && !isLocalhost) {
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

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired or invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        throw new ApiError('Unauthorized', 401);
      }

      if (response.status === 403) {
        throw new ApiError('Forbidden', 403);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.detail || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      return normalizeApiData(await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url = `${endpoint}?${queryParams}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async multipart<T>(endpoint: string, formData: FormData, method: 'POST' | 'PATCH' | 'PUT' = 'POST'): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
      throw new ApiError('Unauthorized', 401);
    }

    if (response.status === 403) {
      throw new ApiError('Forbidden', 403);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.detail || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return normalizeApiData(await response.json()) as T;
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.multipart<T>(endpoint, formData, 'POST');
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth Service
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/login/', credentials);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    }
    
    return response;
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await api.post<{ access: string }>('/auth/refresh/', {
      refresh: refreshToken,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access);
    }
    
    return response;
  },

  async getCurrentUser(): Promise<CurrentUser> {
    return api.get<CurrentUser>('/auth/me/');
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  getStoredTokens(): { access: string | null; refresh: string | null } {
    if (typeof window === 'undefined') {
      return { access: null, refresh: null };
    }
    return {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    };
  },

  isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  },
};

export { ApiError };
