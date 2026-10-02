'use client';

import { ReactNode } from 'react';

import { RestrictedState } from '@/components/common/RestrictedState';
import { useAuth, type PermissionAction } from '@/hooks/useAuth';
import { uiLabels } from '@/lib/ui-ar';

interface OrganizationAccessGuardProps {
  children: ReactNode;
  /**
   * Capability required to render the page. Defaults to `view_organization`.
   * Capability data fails closed: while the user is still loading, or when the
   * backend summary is missing, the guard renders nothing/denies.
   */
  capability?: PermissionAction;
  title?: string;
  message?: string;
}

/**
 * Page-level capability guard for the organization routes.
 *
 * This is UX only — the backend re-validates every request. Direct URL entry
 * must not reveal a page the user has no capability for.
 */
export function OrganizationAccessGuard({
  children,
  capability = 'view_organization',
  title,
  message,
}: OrganizationAccessGuardProps) {
  const { user, isLoading, can } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12" role="status" aria-busy="true">
        <span className="text-sm text-slate-500">...جارٍ التحميل</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!can(capability)) {
    return (
      <RestrictedState
        title={title ?? uiLabels.accessDenied}
        message={message ?? uiLabels.permissionDenied}
      />
    );
  }

  return <>{children}</>;
}
