'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { LoadingState } from '@/components/LoadingState';
import { resolveAreaRedirect } from '@/lib/user-identity';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Role-area guard. This is the second layer after the sidebar: a manually
  // typed URL must not render the wrong workspace even for a moment.
  // The backend remains authoritative for every request these pages make.
  const areaRedirect = isAuthenticated
    ? resolveAreaRedirect(user, pathname)
    : null;

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
      return;
    }
    if (areaRedirect) {
      router.replace(areaRedirect);
    }
  }, [isLoading, isAuthenticated, areaRedirect, router, pathname]);

  // Nothing is rendered while the session is unknown or while a redirect is
  // pending, so an unauthorized page never flashes on screen.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="جارٍ تحميل الجلسة..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="جارٍ تحويلك إلى تسجيل الدخول..." />
      </div>
    );
  }

  if (areaRedirect) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="جارٍ تحويلك إلى المساحة المناسبة..." />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
