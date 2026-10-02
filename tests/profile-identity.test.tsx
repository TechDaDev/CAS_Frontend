import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProfilePage from '@/app/(protected)/profile/page';

const getCurrentUser = vi.fn();
const updateProfile = vi.fn();

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api');
  return {
    ...actual,
    authService: {
      getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
      updateProfile: (...args: unknown[]) => updateProfile(...args),
    },
    api: { downloadBlob: vi.fn().mockRejectedValue(new Error('no image')) },
  };
});

const deanProfile = {
  id: 'u1',
  email: 'dean@example.test',
  first_name: 'Aya',
  last_name: 'Dean',
  is_active: true,
  is_staff: false,
  is_superuser: false,
  institution_id: 'inst-1',
  institution_name: 'كلية الذكاء الاصطناعي',
  user_category: 'teaching' as const,
  roles: ['dean'],
  primary_role: { code: 'dean', name: 'عميد الكلية' },
  primary_position: null,
  primary_unit: null,
  profile_image: null,
};

const platformProfile = {
  ...deanProfile,
  is_staff: true,
  is_superuser: true,
  institution_id: null,
  institution_name: null,
  user_category: null,
  roles: ['superuser'],
  primary_role: { code: 'superuser', name: 'مدير المنصة' },
};

describe('profile page identity', () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    updateProfile.mockReset();
  });

  it('shows the organizational role and not the technical account flags', async () => {
    getCurrentUser.mockResolvedValue(deanProfile);

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText('عميد الكلية')).toBeInTheDocument());

    expect(screen.queryByText('عضو فريق العمل')).not.toBeInTheDocument();
    expect(screen.queryByText('مسؤول عام')).not.toBeInTheDocument();
    expect(screen.getByText('كلية الذكاء الاصطناعي')).toBeInTheDocument();
  });

  it('shows the category separately from the role', async () => {
    getCurrentUser.mockResolvedValue(deanProfile);

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText('الفئة')).toBeInTheDocument());

    expect(screen.getByText('تدريسي')).toBeInTheDocument();
    expect(screen.getByText('عميد الكلية')).toBeInTheDocument();
  });

  it('shows the platform account type for the platform administrator', async () => {
    getCurrentUser.mockResolvedValue(platformProfile);

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText('نوع الحساب')).toBeInTheDocument());

    expect(screen.getByText('مدير المنصة')).toBeInTheDocument();
    expect(screen.queryByText('عضو فريق العمل')).not.toBeInTheDocument();
    expect(screen.queryByText('مسؤول عام')).not.toBeInTheDocument();
    // No institution, position or unit fields for a platform account.
    expect(screen.queryByText('اسم المؤسسة')).not.toBeInTheDocument();
    expect(screen.queryByText('الوحدة التنظيمية')).not.toBeInTheDocument();
  });
});
