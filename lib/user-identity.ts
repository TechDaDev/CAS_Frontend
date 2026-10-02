import type { CurrentUser, UserCategory } from '@/types';

/**
 * Role areas and display identity helpers.
 *
 * Two separate concerns live here:
 *
 * 1. Area separation. The platform administrator exists to create and manage
 *    institutions, so it works in `/platform/*` only. Institution users work in
 *    the institution area and never in `/platform/*`. These helpers are the
 *    single source of truth for both the route guard and the login redirect.
 *
 * 2. Job-title labels. A person's title comes from the backend
 *    (`primary_role.name`), which is a `RoleDefinition.name`. Nothing here maps
 *    role codes to titles, so a new role such as "مدير شعبة" needs no frontend
 *    change.
 *
 * Frontend routing is user experience only. The backend remains authoritative
 * for every request.
 */

export const PLATFORM_HOME = '/platform/institutions';
export const INSTITUTION_HOME = '/dashboard';
export const PLATFORM_ADMIN_ROLE_NAME = 'مدير المنصة';
export const INSTITUTION_USER_FALLBACK_ROLE = 'مستخدم المؤسسة';

const CATEGORY_LABELS: Record<UserCategory, string> = {
  teaching: 'تدريسي',
  staff: 'موظف',
};

export function isPlatformPath(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }
  return pathname === '/platform' || pathname.startsWith('/platform/');
}

/**
 * Account routes that belong to no area.
 *
 * `/profile` is redesigned so it renders either an institution profile or the
 * platform account type, so the platform administrator may open it without
 * entering the institution workspace.
 */
export function isNeutralPath(pathname: string | null | undefined): boolean {
  return pathname === '/profile';
}

export function isPlatformSuperAdmin(
  user: Pick<CurrentUser, 'is_superuser'> | null | undefined,
): boolean {
  // `is_superuser` identifies the platform administrator. `is_staff` is a Django
  // administration flag and is deliberately not consulted.
  return Boolean(user?.is_superuser);
}

/** Landing page for a freshly authenticated session. */
export function resolveLandingPath(
  user: Pick<CurrentUser, 'is_superuser'> | null | undefined,
): string {
  return isPlatformSuperAdmin(user) ? PLATFORM_HOME : INSTITUTION_HOME;
}

/**
 * Validate a `redirect` query parameter against the caller's role area.
 *
 * An arbitrary redirect is never trusted: a platform administrator may only be
 * sent inside `/platform`, and an institution user may never be sent there.
 */
export function resolveRedirectTarget(
  user: Pick<CurrentUser, 'is_superuser'> | null | undefined,
  redirect: string | null | undefined,
): string {
  const fallback = resolveLandingPath(user);
  if (!redirect) {
    return fallback;
  }

  const target = redirect.trim();
  if (!target.startsWith('/') || target.startsWith('//')) {
    return fallback;
  }
  if (isPlatformPath(target)) {
    return isPlatformSuperAdmin(user) ? target : fallback;
  }
  return isPlatformSuperAdmin(user) ? fallback : target;
}

/**
 * Area guard result for a pathname: the path to redirect to, or `null` when the
 * current area matches the caller's role.
 */
export function resolveAreaRedirect(
  user: Pick<CurrentUser, 'is_superuser'> | null | undefined,
  pathname: string | null | undefined,
): string | null {
  if (!user || !pathname) {
    return null;
  }

  if (isNeutralPath(pathname)) {
    return null;
  }

  if (isPlatformSuperAdmin(user)) {
    return isPlatformPath(pathname) ? null : PLATFORM_HOME;
  }

  return isPlatformPath(pathname) ? INSTITUTION_HOME : null;
}

/** Job title for display. Falls back to neutral labels, never technical flags. */
export function resolveRoleLabel(
  user:
    | Pick<CurrentUser, 'is_superuser' | 'primary_role'>
    | null
    | undefined,
): string {
  if (!user) {
    return INSTITUTION_USER_FALLBACK_ROLE;
  }
  if (isPlatformSuperAdmin(user)) {
    return user.primary_role?.name || PLATFORM_ADMIN_ROLE_NAME;
  }
  return user.primary_role?.name || INSTITUTION_USER_FALLBACK_ROLE;
}

/** Organizational unit name for display, when available. */
export function resolveUnitLabel(
  user: Pick<CurrentUser, 'primary_unit'> | null | undefined,
): string | null {
  return user?.primary_unit?.name || null;
}

/** Position title for display, when available. */
export function resolvePositionLabel(
  user: Pick<CurrentUser, 'primary_position'> | null | undefined,
): string | null {
  return user?.primary_position?.title || null;
}

/**
 * Category ("تدريسي" / "موظف") is a personnel classification, not a job title.
 * Keep the two concepts apart in the interface.
 */
export function resolveCategoryLabel(
  category: UserCategory | null | undefined,
): string {
  if (!category) {
    return '-';
  }
  return CATEGORY_LABELS[category] ?? category;
}
