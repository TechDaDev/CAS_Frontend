import { z } from 'zod';

const rawEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().trim().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).default('Correspondence Archiving System'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().trim().min(2).default('ar'),
});

const DEFAULT_API_ORIGIN = 'https://corrarchivsystem.up.railway.app';
const INVALID_FRONTEND_API_HOSTS = new Set(['casplatform.up.railway.app']);

function normalizeApiUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function resolveConfiguredApiUrl(input: string | undefined): string {
  if (!input) {
    return normalizeApiUrl(DEFAULT_API_ORIGIN);
  }

  try {
    const parsed = new URL(input);
    if (INVALID_FRONTEND_API_HOSTS.has(parsed.hostname)) {
      return normalizeApiUrl(DEFAULT_API_ORIGIN);
    }
  } catch {
    return normalizeApiUrl(DEFAULT_API_ORIGIN);
  }

  return normalizeApiUrl(input);
}

function resolveEnv() {
  const parsed = rawEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  });

  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }

  const configuredApiUrl = parsed.data.NEXT_PUBLIC_API_URL?.trim();
  const apiUrl = resolveConfiguredApiUrl(configuredApiUrl);

  return {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_APP_NAME: parsed.data.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_DEFAULT_LOCALE: parsed.data.NEXT_PUBLIC_DEFAULT_LOCALE,
  };
}

export const env = resolveEnv();

export const API_BASE_URL = env.NEXT_PUBLIC_API_URL;
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');