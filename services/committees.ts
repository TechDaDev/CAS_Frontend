import { api } from '@/services/api';
import { 
  CommitteeType, 
  Committee, 
  CommitteeMember,
  PaginatedResponse 
} from '@/types';

// Committee Types
export interface CommitteeTypeFilters {
  institution?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreateCommitteeTypePayload {
  institution: string;
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

// Committees
export interface CommitteeFilters {
  institution?: string;
  committeeType?: string;
  scopeUnit?: string;
  status?: string;
  isActive?: boolean;
  isPermanent?: boolean;
  page?: number;
}

export interface CreateCommitteePayload {
  institution: string;
  name: string;
  code: string;
  committee_type: string;
  description?: string;
  scope_unit?: string;
  is_permanent?: boolean;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'inactive' | 'dissolved';
  is_active?: boolean;
}

// Committee Members
export interface CommitteeMemberFilters {
  committee?: string;
  user?: string;
  memberRole?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreateCommitteeMemberPayload {
  institution: string;
  committee: string;
  assignment: string;
  role: 'chair' | 'vice_chair' | 'secretary' | 'member';
  joined_at?: string;
  is_active?: boolean;
}

class CommitteesService {
  // Committee Types
  async getCommitteeTypes(filters: CommitteeTypeFilters = {}): Promise<PaginatedResponse<CommitteeType>> {
    const params: Record<string, string> = {};
    if (filters.institution) params.institution = filters.institution;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<CommitteeType>>('/committees/types/', params);
  }

  async createCommitteeType(payload: CreateCommitteeTypePayload): Promise<CommitteeType> {
    return api.post<CommitteeType>('/committees/types/', payload);
  }

  async updateCommitteeType(id: string, payload: Partial<CreateCommitteeTypePayload>): Promise<CommitteeType> {
    return api.patch<CommitteeType>(`/committees/types/${id}/`, payload);
  }

  // Committees
  async getCommittees(filters: CommitteeFilters = {}): Promise<PaginatedResponse<Committee>> {
    const params: Record<string, string> = {};
    if (filters.institution) params.institution = filters.institution;
    if (filters.committeeType) params.committee_type = filters.committeeType;
    if (filters.scopeUnit) params.scope_unit = filters.scopeUnit;
    if (filters.status) params.status = filters.status;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.isPermanent !== undefined) params.is_permanent = filters.isPermanent.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<Committee>>('/committees/', params);
  }

  async getCommittee(id: string): Promise<Committee> {
    return api.get<Committee>(`/committees/${id}/`);
  }

  async createCommittee(payload: CreateCommitteePayload): Promise<Committee> {
    return api.post<Committee>('/committees/', payload);
  }

  async updateCommittee(id: string, payload: Partial<CreateCommitteePayload>): Promise<Committee> {
    return api.patch<Committee>(`/committees/${id}/`, payload);
  }

  // Committee Members
  async getCommitteeMembers(filters: CommitteeMemberFilters = {}): Promise<PaginatedResponse<CommitteeMember>> {
    const params: Record<string, string> = {};
    if (filters.committee) params.committee = filters.committee;
    if (filters.user) params.user = filters.user;
    if (filters.memberRole) params.role = filters.memberRole;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<CommitteeMember>>('/committees/members/', params);
  }

  async getCommitteeMembersByCommitteeId(committeeId: string): Promise<PaginatedResponse<CommitteeMember>> {
    return api.get<PaginatedResponse<CommitteeMember>>(`/committees/${committeeId}/members/`);
  }

  async createCommitteeMember(payload: CreateCommitteeMemberPayload): Promise<CommitteeMember> {
    return api.post<CommitteeMember>('/committees/members/', payload);
  }

  async updateCommitteeMember(id: string, payload: Partial<CreateCommitteeMemberPayload>): Promise<CommitteeMember> {
    return api.patch<CommitteeMember>(`/committees/members/${id}/`, payload);
  }
}

export const committeesService = new CommitteesService();
