import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarNav } from '@/components/SidebarNav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      first_name: 'Aya',
      last_name: 'Admin',
      institution_name: 'Workflow College',
      is_superuser: false,
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    can: (action: string) => action !== 'view_audit' && action !== 'manage_institution_users',
  }),
}));

describe('SidebarNav', () => {
  it('hides unauthorized items', () => {
    render(<SidebarNav />);

    expect(screen.queryByText('سجل التدقيق')).not.toBeInTheDocument();
    expect(screen.queryByText('مستخدمو المؤسسة')).not.toBeInTheDocument();
    expect(screen.getByText('المعاملات')).toBeInTheDocument();
  });
});