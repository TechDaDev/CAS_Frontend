'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { CurrentUser } from '@/types';
import { authService, api } from '@/services/api';

export type PermissionAction =
  | 'create_transaction'
  | 'update_transaction'
  | 'route_transaction'
  | 'approve_transaction'
  | 'register_incoming'
  | 'register_outgoing'
  | 'prepare_print'
  | 'record_wet_signature'
  | 'record_dispatch'
  | 'upload_attachment'
  | 'view_attachment'
  | 'manage_institution_users'
  | 'view_audit'
  | 'view_reports';

const permissionToSummaryField: Record<PermissionAction, keyof NonNullable<CurrentUser['access_summary']>> = {
  create_transaction: 'can_create_transaction',
  update_transaction: 'can_update_transaction',
  route_transaction: 'can_route_transaction',
  approve_transaction: 'can_approve_transaction',
  register_incoming: 'can_register_incoming',
  register_outgoing: 'can_register_outgoing',
  prepare_print: 'can_prepare_print',
  record_wet_signature: 'can_record_wet_signature',
  record_dispatch: 'can_record_dispatch',
  upload_attachment: 'can_upload_attachment',
  view_attachment: 'can_view_attachment',
  manage_institution_users: 'can_manage_institution_users',
  view_audit: 'can_view_audit',
  view_reports: 'can_view_reports',
};

function canUser(user: CurrentUser | null, action: PermissionAction): boolean {
  if (!user) {
    return false;
  }

  if (user.is_superuser) {
    return true;
  }

  const summaryField = permissionToSummaryField[action];
  const summaryValue = user.access_summary?.[summaryField];
  if (typeof summaryValue === 'boolean') {
    return summaryValue;
  }

  if (user.permissions?.includes(action)) {
    return true;
  }

  if (!user.is_staff) {
    return false;
  }

  switch (action) {
    case 'view_attachment':
    case 'view_reports':
    case 'upload_attachment':
    case 'create_transaction':
    case 'update_transaction':
      return true;
    default:
      return false;
  }
}

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<CurrentUser>;
  logout: () => void;
  refreshUser: () => Promise<CurrentUser | null>;
  hasPermission: (action: PermissionAction) => boolean;
  can: (action: PermissionAction) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { access, refresh } = authService.getStoredTokens();
      if (access || refresh) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    api.setAuthFailureHandler(() => {
      setUser(null);
      const redirect = pathname && pathname !== '/login' ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${redirect}`);
    });

    return () => {
      api.setAuthFailureHandler(null);
    };
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login({ email, password });
      const userData = await refreshUser();
      if (!userData) {
        throw new Error('Unable to load authenticated user profile.');
      }

      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.replace('/login');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    hasPermission: (action) => canUser(user, action),
    can: (action) => canUser(user, action),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
