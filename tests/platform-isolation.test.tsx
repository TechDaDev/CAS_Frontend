import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CurrentUser } from '@/types';
import {
  INSTITUTION_HOME,
  PLATFORM_HOME,
  resolveAreaRedirect,
  resolveCategoryLabel,
  resolveLandingPath,
  resolveRedirectTarget,
  resolveRoleLabel,
} from '@/lib/user-identity';

function makeUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: 'u1',
    email: 'user@example.test',
    first_name: 'Aya',
    last_name: 'User',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    institution_name: 'كلية الذكاء الاصطناعي',
    ...overrides,
  };
}

const superAdmin = makeUser({
  email: 'root@example.test',
  is_superuser: true,
  is_staff: true,
  institution_id: null,
  institution_name: null,
  primary_role: { code: 'superuser', name: 'مدير المنصة' },
});

const dean = makeUser({
  is_staff: false,
  is_superuser: false,
  institution_id: 'inst-1',
  user_category: 'teaching',
  roles: ['dean'],
  primary_role: { code: 'dean', name: 'عميد الكلية' },
});

describe('role area separation', () => {
  it('lands the platform administrator on the institution management page', () => {
    expect(resolveLandingPath(superAdmin)).toBe(PLATFORM_HOME);
    expect(resolveLandingPath(superAdmin)).toBe('/platform/institutions');
  });

  it('lands an institution user on the dashboard', () => {
    expect(resolveLandingPath(dean)).toBe(INSTITUTION_HOME);
  });

  it('blocks the platform administrator from institution routes', () => {
    for (const path of [
      '/dashboard',
      '/transactions',
      '/organization',
      '/institution-users',
      '/reports',
    ]) {
      expect(resolveAreaRedirect(superAdmin, path)).toBe(PLATFORM_HOME);
    }
  });

  it('allows the platform administrator inside the platform area', () => {
    expect(resolveAreaRedirect(superAdmin, '/platform')).toBeNull();
    expect(resolveAreaRedirect(superAdmin, '/platform/institutions')).toBeNull();
  });

  it('keeps the account profile route neutral for both areas', () => {
    // /profile is redesigned to render the platform account type, so it is not
    // part of the institution workspace.
    expect(resolveAreaRedirect(superAdmin, '/profile')).toBeNull();
    expect(resolveAreaRedirect(dean, '/profile')).toBeNull();
  });

  it('blocks an institution user from platform routes', () => {
    expect(resolveAreaRedirect(dean, '/platform')).toBe(INSTITUTION_HOME);
    expect(resolveAreaRedirect(dean, '/platform/institutions')).toBe(INSTITUTION_HOME);
  });

  it('leaves institution users inside institution routes', () => {
    expect(resolveAreaRedirect(dean, '/dashboard')).toBeNull();
    expect(resolveAreaRedirect(dean, '/organization')).toBeNull();
  });

  it('does not trust an arbitrary redirect parameter', () => {
    // The platform administrator is never sent into the institution workspace.
    expect(resolveRedirectTarget(superAdmin, '/organization')).toBe(PLATFORM_HOME);
    expect(resolveRedirectTarget(superAdmin, '/platform/institutions')).toBe(
      '/platform/institutions',
    );
    // An institution user is never sent into the platform area.
    expect(resolveRedirectTarget(dean, '/platform/institutions')).toBe(INSTITUTION_HOME);
    expect(resolveRedirectTarget(dean, '/transactions')).toBe('/transactions');
    // Absolute or protocol-relative targets are refused.
    expect(resolveRedirectTarget(dean, 'https://evil.example.com')).toBe(INSTITUTION_HOME);
    expect(resolveRedirectTarget(dean, '//evil.example.com')).toBe(INSTITUTION_HOME);
  });
});

describe('business role labels', () => {
  it('labels the platform administrator', () => {
    expect(resolveRoleLabel(superAdmin)).toBe('مدير المنصة');
  });

  it('labels the dean from the backend role name', () => {
    expect(resolveRoleLabel(dean)).toBe('عميد الكلية');
  });

  it('uses an arbitrary RoleDefinition name without a frontend change', () => {
    const custom = makeUser({
      primary_role: { code: 'registry_office_manager', name: 'مدير وحدة التسجيل' },
    });

    expect(resolveRoleLabel(custom)).toBe('مدير وحدة التسجيل');
  });

  it('falls back to a neutral label when no role exists', () => {
    expect(resolveRoleLabel(makeUser())).toBe('مستخدم المؤسسة');
  });

  it('never labels a user from is_staff', () => {
    const staffOnly = makeUser({ is_staff: true, primary_role: null });

    expect(resolveRoleLabel(staffOnly)).toBe('مستخدم المؤسسة');
  });

  it('keeps the category separate from the role', () => {
    expect(resolveCategoryLabel('teaching')).toBe('تدريسي');
    expect(resolveCategoryLabel('staff')).toBe('موظف');
    expect(resolveRoleLabel(dean)).toBe('عميد الكلية');
    // A teaching member can be a dean: the two labels differ on purpose.
    expect(resolveCategoryLabel(dean.user_category)).not.toBe(resolveRoleLabel(dean));
  });
});

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({ can: () => true }),
}));

function mockSession(user: CurrentUser, pathname: string) {
  vi.doMock('next/navigation', () => ({ usePathname: () => pathname }));
  vi.doMock('@/hooks/useAuth', () => ({
    useAuth: () => ({ user, isLoading: false }),
  }));
}

describe('sidebar navigation per role', () => {
  it('shows only platform navigation to the platform administrator', async () => {
    mockSession(superAdmin, '/platform/institutions');
    vi.resetModules();
    const { SidebarNav: Sidebar } = await import('@/components/SidebarNav');

    render(<Sidebar />);

    expect(screen.getByText('المؤسسات')).toBeInTheDocument();
    expect(screen.queryByText('المعاملات')).not.toBeInTheDocument();
    expect(screen.queryByText('الهيكل التنظيمي')).not.toBeInTheDocument();
    expect(screen.queryByText('مستخدمو المؤسسة')).not.toBeInTheDocument();
    expect(screen.queryByText('التقارير')).not.toBeInTheDocument();
  });

  it('shows institution navigation and the real role to a dean', async () => {
    mockSession(dean, '/dashboard');
    vi.resetModules();
    const { SidebarNav: Sidebar } = await import('@/components/SidebarNav');

    render(<Sidebar />);

    expect(screen.getByText('المعاملات')).toBeInTheDocument();
    expect(screen.queryByText('المؤسسات')).not.toBeInTheDocument();
    expect(screen.getByText('عميد الكلية')).toBeInTheDocument();
    expect(screen.queryByText('موظف')).not.toBeInTheDocument();
  });
});
