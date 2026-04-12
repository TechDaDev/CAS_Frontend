import { api } from './api';
import { InstitutionUser, PaginatedResponse, UserCategory } from '@/types';

export interface CreateInstitutionUserData {
  institution?: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_category: UserCategory;
  profile_image?: File;
  is_active?: boolean;
}

export interface UpdateInstitutionUserData {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  user_category?: UserCategory;
  profile_image?: File | null;
}

export const institutionUsersService = {
  async listInstitutionUsers(params?: {
    search?: string;
    user_category?: UserCategory;
    is_active?: boolean;
    institution?: string;
    page?: number;
  }): Promise<PaginatedResponse<InstitutionUser>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.user_category) queryParams.append('user_category', params.user_category);
    if (params?.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
    if (params?.institution) queryParams.append('institution', params.institution);
    if (params?.page) queryParams.append('page', String(params.page));

    const query = queryParams.toString();
    return api.get<PaginatedResponse<InstitutionUser>>(`/accounts/institution-users/${query ? `?${query}` : ''}`);
  },

  async getInstitutionUser(id: string): Promise<InstitutionUser> {
    return api.get<InstitutionUser>(`/accounts/institution-users/${id}/`);
  },

  async createInstitutionUser(data: CreateInstitutionUserData): Promise<InstitutionUser> {
    // Use FormData for multipart upload if profile_image is provided
    if (data.profile_image) {
      const formData = new FormData();
      if (data.institution) {
        formData.append('institution', data.institution);
      }
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('user_category', data.user_category);
      formData.append('profile_image', data.profile_image);
      if (data.is_active !== undefined) {
        formData.append('is_active', String(data.is_active));
      }

      return api.multipart<InstitutionUser>('/accounts/institution-users/', formData, 'POST');
    }

    // Regular JSON request if no profile_image
    return api.post<InstitutionUser>('/accounts/institution-users/', {
      ...(data.institution ? { institution: data.institution } : {}),
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      user_category: data.user_category,
      is_active: data.is_active,
    });
  },

  async updateInstitutionUser(id: string, data: UpdateInstitutionUserData): Promise<InstitutionUser> {
    // Use FormData for multipart upload if profile_image is provided or explicitly cleared
    if (data.profile_image !== undefined) {
      const formData = new FormData();
      if (data.first_name !== undefined) formData.append('first_name', data.first_name);
      if (data.last_name !== undefined) formData.append('last_name', data.last_name);
      if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
      if (data.user_category !== undefined) formData.append('user_category', data.user_category);
      if (data.profile_image instanceof File) {
        formData.append('profile_image', data.profile_image);
      } else {
        formData.append('profile_image', '');
      }

      return api.multipart<InstitutionUser>(`/accounts/institution-users/${id}/`, formData, 'PATCH');
    }

    // Regular JSON request if no profile_image
    const updateData: Record<string, unknown> = {};
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.user_category !== undefined) updateData.user_category = data.user_category;

    return api.patch<InstitutionUser>(`/accounts/institution-users/${id}/`, updateData);
  },
};
