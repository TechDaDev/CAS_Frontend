import { api } from './api';
import { Institution, PaginatedResponse } from '@/types';

export interface CreateInstitutionData {
  name: string;
  slug: string;
  code: string;
  description?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
}

export interface AssignDeanData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UpdateInstitutionData {
  name?: string;
  slug?: string;
  code?: string;
  description?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
  logo?: File;
}

export const institutionsService = {
  async listInstitutions(params?: { search?: string; is_active?: boolean }): Promise<PaginatedResponse<Institution>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
    
    const query = queryParams.toString();
    return api.get<PaginatedResponse<Institution>>(`/institutions/${query ? `?${query}` : ''}`);
  },

  async getInstitution(id: string): Promise<Institution> {
    return api.get<Institution>(`/institutions/${id}/`);
  },

  async createInstitution(data: CreateInstitutionData): Promise<Institution> {
    return api.post<Institution>('/institutions/', data);
  },

  async updateInstitution(id: string, data: UpdateInstitutionData): Promise<Institution> {
    // Use FormData for multipart upload if logo is provided
    if (data.logo) {
      const formData = new FormData();
      if (data.name !== undefined) formData.append('name', data.name);
      if (data.slug !== undefined) formData.append('slug', data.slug);
      if (data.code !== undefined) formData.append('code', data.code);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.address !== undefined) formData.append('address', data.address);
      if (data.contact_email !== undefined) formData.append('contact_email', data.contact_email);
      if (data.contact_phone !== undefined) formData.append('contact_phone', data.contact_phone);
      if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
      formData.append('logo', data.logo);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/institutions/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      return response.json();
    }

    // Regular JSON request if no logo
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.contact_email !== undefined) updateData.contact_email = data.contact_email;
    if (data.contact_phone !== undefined) updateData.contact_phone = data.contact_phone;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    return api.patch<Institution>(`/institutions/${id}/`, updateData);
  },

  async assignDean(institutionId: string, data: AssignDeanData): Promise<Institution> {
    return api.post<Institution>(`/institutions/${institutionId}/assign-dean/`, data);
  },
};
