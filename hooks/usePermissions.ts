'use client';

import { useAuth, type PermissionAction } from '@/hooks/useAuth';

export function usePermissions() {
  const { can, hasPermission, isLoading } = useAuth();

  return {
    isLoading,
    can,
    hasPermission,
    canCreateTransaction: can('create_transaction'),
    canUpdateTransaction: can('update_transaction'),
    canRouteTransaction: can('route_transaction'),
    canApproveTransaction: can('approve_transaction'),
    canRegisterIncoming: can('register_incoming'),
    canRegisterOutgoing: can('register_outgoing'),
    canPreparePrint: can('prepare_print'),
    canRecordWetSignature: can('record_wet_signature'),
    canRecordDispatch: can('record_dispatch'),
    canUploadAttachment: can('upload_attachment'),
    canViewAttachment: can('view_attachment'),
    canManageInstitutionUsers: can('manage_institution_users'),
    canViewAudit: can('view_audit'),
    canViewReports: can('view_reports'),
  } satisfies Record<string, boolean | ((action: PermissionAction) => boolean)> & {
    isLoading: boolean;
  };
}