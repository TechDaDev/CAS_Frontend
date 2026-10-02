import type { PermissionAction } from '@/hooks/useAuth';
import { uiLabels } from '@/lib/ui-ar';

/**
 * The authoritative StructurePermissionRule action vocabulary.
 *
 * These values mirror `StructurePermissionRule.ACTION_CHOICES` on the backend
 * exactly. The backend also exposes them at
 * `GET /api/organization/structure-permission-rules/actions/`; this table adds
 * the Arabic labels used by the UI. Never send the generic
 * `create`/`update`/`delete`/`view`/`manage` actions — the backend rejects them.
 */
export const STRUCTURE_RULE_ACTIONS = [
  { value: 'create_unit', label: 'إنشاء وحدة' },
  { value: 'update_unit', label: 'تعديل وحدة' },
  { value: 'create_position', label: 'إنشاء منصب' },
  { value: 'update_position', label: 'تعديل منصب' },
  { value: 'create_assignment', label: 'إنشاء تخصيص' },
  { value: 'update_assignment', label: 'تعديل تخصيص' },
  { value: 'create_committee', label: 'إنشاء لجنة' },
  { value: 'update_committee', label: 'تعديل لجنة' },
  { value: 'manage_committee_members', label: 'إدارة أعضاء اللجنة' },
  { value: 'create_transaction', label: 'إنشاء معاملة' },
  { value: 'update_transaction', label: 'تعديل معاملة' },
  { value: 'route_transaction', label: 'إحالة معاملة' },
  { value: 'approve_transaction', label: 'الموافقة على معاملة' },
  { value: 'register_incoming', label: 'تسجيل وارد' },
  { value: 'register_outgoing', label: 'تسجيل صادر' },
  { value: 'prepare_print', label: 'تحضير الطباعة' },
  { value: 'record_wet_signature', label: 'تسجيل التوقيع اليدوي' },
  { value: 'record_dispatch', label: 'تسجيل الإرسال' },
  { value: 'upload_attachment', label: 'رفع مرفق' },
  { value: 'view_attachment', label: 'عرض مرفق' },
  { value: 'create_institution_user', label: 'إنشاء مستخدم مؤسسة' },
] as const;

export const STRUCTURE_RULE_ACTION_VALUES: string[] = STRUCTURE_RULE_ACTIONS.map(
  (action) => action.value,
);

export function getStructureRuleActionLabel(value: string): string {
  return STRUCTURE_RULE_ACTIONS.find((action) => action.value === value)?.label ?? value;
}

/** Capability required to open each organization route. */
export const ORGANIZATION_ROUTE_CAPABILITIES: Record<string, PermissionAction> = {
  '/organization/tree': 'view_organization',
  '/organization/units': 'view_organization',
  '/organization/unit-types': 'manage_structure_definitions',
  '/organization/positions': 'view_organization',
  '/organization/position-types': 'manage_structure_definitions',
  '/organization/assignments': 'view_organization',
  '/organization/role-definitions': 'manage_structure_definitions',
  '/organization/structure-rules': 'manage_structure_rules',
};

interface ApiErrorLike {
  status?: number;
}

/**
 * Turn a failed API call into a message the owner can act on.
 *
 * A 403 must never be presented as an empty list: "no permission", "network or
 * server failure" and "legitimately empty" are three different states.
 */
export function resolveLoadErrorMessage(error: unknown, fallback?: string): string {
  const status = (error as ApiErrorLike | undefined)?.status;
  if (status === 403) {
    return uiLabels.permissionDenied;
  }
  if (status === 0 || status === 408) {
    return uiLabels.networkError;
  }
  return fallback ?? uiLabels.loadFailed;
}

export function isPermissionError(error: unknown): boolean {
  return (error as ApiErrorLike | undefined)?.status === 403;
}
