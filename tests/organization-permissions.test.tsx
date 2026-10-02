import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CurrentUserSchema } from '@/lib/schemas';
import {
  STRUCTURE_RULE_ACTIONS,
  resolveLoadErrorMessage,
  getStructureRuleActionLabel,
} from '@/lib/org-actions';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

const permissionsMock = vi.hoisted(() => ({
  granted: new Set<string>(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      first_name: 'Aya',
      last_name: 'Admin',
      institution_name: 'College A',
      is_superuser: false,
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    can: (action: string) => permissionsMock.granted.has(action),
  }),
}));

// Imported after the mocks so the component picks them up.
const { SidebarNav } = await import('@/components/SidebarNav');

describe('SidebarNav organization gating', () => {
  it('hides the organization item when view_organization is not granted', () => {
    permissionsMock.granted = new Set(['view_reports']);

    render(<SidebarNav />);

    // Reports and Organization are independent permissions.
    expect(screen.getByText('التقارير')).toBeInTheDocument();
    expect(screen.queryByText('الهيكل التنظيمي')).not.toBeInTheDocument();
  });

  it('shows the organization item when view_organization is granted', () => {
    permissionsMock.granted = new Set(['view_organization']);

    render(<SidebarNav />);

    expect(screen.getByText('الهيكل التنظيمي')).toBeInTheDocument();
    expect(screen.queryByText('التقارير')).not.toBeInTheDocument();
  });
});

describe('structure rule action vocabulary', () => {
  it('matches the backend vocabulary and never sends generic actions', () => {
    const values = STRUCTURE_RULE_ACTIONS.map((action) => action.value);

    expect(values).toContain('create_unit');
    expect(values).toContain('update_assignment');
    expect(values).toContain('manage_committee_members');
    expect(values).toContain('create_institution_user');

    for (const generic of ['create', 'update', 'delete', 'view', 'manage']) {
      expect(values).not.toContain(generic);
    }
  });

  it('renders Arabic labels', () => {
    expect(getStructureRuleActionLabel('create_unit')).toBe('إنشاء وحدة');
    expect(getStructureRuleActionLabel('update_unit')).toBe('تعديل وحدة');
    expect(getStructureRuleActionLabel('create_position')).toBe('إنشاء منصب');
  });
});

describe('load error classification', () => {
  it('distinguishes 403, network failure and other errors', () => {
    expect(resolveLoadErrorMessage({ status: 403 })).toBe(
      'ليس لديك صلاحية للوصول إلى هذه البيانات أو تنفيذ هذا الإجراء.',
    );
    expect(resolveLoadErrorMessage({ status: 0 })).toContain('تعذر الاتصال بالخادم');
    expect(resolveLoadErrorMessage({ status: 500 }, 'fallback')).toBe('fallback');
  });
});

describe('current user schema', () => {
  it('keeps the organization capability fields from the backend', () => {
    const parsed = CurrentUserSchema.parse({
      id: 'u1',
      email: 'dean@example.test',
      first_name: 'D',
      last_name: 'U',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      institution_id: '11111111-1111-1111-1111-111111111111',
      institution_ids: ['11111111-1111-1111-1111-111111111111'],
      institution_name: 'College A',
      roles: ['dean'],
      access_summary: {
        can_view_organization: true,
        can_create_unit: true,
        can_update_unit: true,
        can_manage_structure_definitions: true,
        can_manage_institution_users: true,
        can_view_reports: true,
      },
    });

    // Zod strips unknown keys by default, so every capability the backend sends
    // must be declared in the schema or it would silently disappear.
    expect(parsed.institution_id).toBe('11111111-1111-1111-1111-111111111111');
    expect(parsed.access_summary?.can_view_organization).toBe(true);
    expect(parsed.access_summary?.can_create_unit).toBe(true);
    expect(parsed.access_summary?.can_manage_structure_definitions).toBe(true);
    expect(parsed.access_summary?.can_manage_institution_users).toBe(true);
    expect(parsed.roles).toEqual(['dean']);
  });

  it('keeps is_staff separate from business capabilities', () => {
    const parsed = CurrentUserSchema.parse({
      id: 'u2',
      email: 'dean@example.test',
      first_name: 'D',
      last_name: 'U',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      institution_name: 'College A',
      access_summary: { can_view_organization: true },
    });

    expect(parsed.is_staff).toBe(false);
    expect(parsed.access_summary?.can_view_organization).toBe(true);
    expect(parsed.access_summary?.can_create_unit).toBeUndefined();
  });
});
