'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { ApiError } from '@/services/api';
import { AuthProvider } from '@/hooks/useAuth';

function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= 2) {
    return false;
  }

  if (!(error instanceof ApiError)) {
    return true;
  }

  if ([401, 403, 404, 429].includes(error.status)) {
    return false;
  }

  return error.status === 0 || error.status >= 500;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: shouldRetry,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}