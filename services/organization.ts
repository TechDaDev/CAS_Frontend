import { api } from '@/services/api';
import { 
  UnitType, 
  Unit, 
  UnitTreeNode,
  PositionType, 
  Position, 
  RoleDefinition, 
  Assignment,
  StructurePermissionRule,
  PaginatedResponse 
} from '@/types';

// Unit Types
export interface UnitTypeFilters {
  institution?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreateUnitTypePayload {
  institution: string;
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

// Units
export interface UnitFilters {
  institution?: string;
  parent?: string;
  unitType?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreateUnitPayload {
  institution: string;
  name: string;
  code: string;
  unit_type: string;
  parent?: string;
  description?: string;
  handles_incoming_registry?: boolean;
  handles_outgoing_registry?: boolean;
  is_active?: boolean;
}

// Position Types
export interface PositionTypeFilters {
  institution?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreatePositionTypePayload {
  institution: string;
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

// Positions
export interface PositionFilters {
  institution?: string;
  organizationalUnit?: string;
  positionType?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreatePositionPayload {
  institution: string;
  title: string;
  code: string;
  position_type: string;
  organizational_unit: string;
  description?: string;
  is_active?: boolean;
}

// Role Definitions
export interface RoleDefinitionFilters {
  institution?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreateRoleDefinitionPayload {
  institution: string;
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

// Assignments
export interface AssignmentFilters {
  user?: string;
  institution?: string;
  organizationalUnit?: string;
  position?: string;
  roleDefinition?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreateAssignmentPayload {
  user: string;
  institution: string;
  organizational_unit: string;
  position: string;
  role_definition?: string;
  is_primary?: boolean;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

// Structure Permission Rules
export interface StructureRuleFilters {
  institution?: string;
  roleDefinition?: string;
  action?: string;
  isActive?: boolean;
  page?: number;
}

export interface CreateStructureRulePayload {
  institution: string;
  role_definition: string;
  action: string;
  target_unit_type?: string;
  allowed_parent_unit_type?: string;
  is_active?: boolean;
}

class OrganizationService {
  // Unit Types
  async getUnitTypes(filters: UnitTypeFilters = {}): Promise<PaginatedResponse<UnitType>> {
    const params: Record<string, string> = {};
    if (filters.institution) params.institution = filters.institution;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<UnitType>>('/organization/unit-types/', params);
  }

  async createUnitType(payload: CreateUnitTypePayload): Promise<UnitType> {
    return api.post<UnitType>('/organization/unit-types/', payload);
  }

  async updateUnitType(id: string, payload: Partial<CreateUnitTypePayload>): Promise<UnitType> {
    return api.patch<UnitType>(`/organization/unit-types/${id}/`, payload);
  }

  // Units
  async getUnits(filters: UnitFilters = {}): Promise<PaginatedResponse<Unit>> {
    const params: Record<string, string> = {};
    if (filters.institution) params.institution = filters.institution;
    if (filters.parent) params.parent = filters.parent;
    if (filters.unitType) params.unit_type = filters.unitType;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<Unit>>('/organization/units/', params);
  }

  async getUnitTree(institutionId: string): Promise<UnitTreeNode[]> {
    return api.get<UnitTreeNode[]>(`/organization/units/tree/`, { institution: institutionId });
  }

  async createUnit(payload: CreateUnitPayload): Promise<Unit> {
    return api.post<Unit>('/organization/units/', payload);
  }

  async updateUnit(id: string, payload: Partial<CreateUnitPayload>): Promise<Unit> {
    return api.patch<Unit>(`/organization/units/${id}/`, payload);
  }

  // Position Types
  async getPositionTypes(filters: PositionTypeFilters = {}): Promise<PaginatedResponse<PositionType>> {
    const params: Record<string, string> = {};
    if (filters.institution) params.institution = filters.institution;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<PositionType>>('/organization/position-types/', params);
  }

  async createPositionType(payload: CreatePositionTypePayload): Promise<PositionType> {
    return api.post<PositionType>('/organization/position-types/', payload);
  }

  async updatePositionType(id: string, payload: Partial<CreatePositionTypePayload>): Promise<PositionType> {
    return api.patch<PositionType>(`/organization/position-types/${id}/`, payload);
  }

  // Positions
  async getPositions(filters: PositionFilters = {}): Promise<PaginatedResponse<Position>> {
    const params: Record<string, string> = {};
    if (filters.institution) params.institution = filters.institution;
    if (filters.organizationalUnit) params.organizational_unit = filters.organizationalUnit;
    if (filters.positionType) params.position_type = filters.positionType;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<Position>>('/organization/positions/', params);
  }

  async createPosition(payload: CreatePositionPayload): Promise<Position> {
    return api.post<Position>('/organization/positions/', payload);
  }

  async updatePosition(id: string, payload: Partial<CreatePositionPayload>): Promise<Position> {
    return api.patch<Position>(`/organization/positions/${id}/`, payload);
  }

  // Role Definitions
  async getRoleDefinitions(filters: RoleDefinitionFilters = {}): Promise<PaginatedResponse<RoleDefinition>> {
    const params: Record<string, string> = {};
    if (filters.institution) params.institution = filters.institution;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<RoleDefinition>>('/organization/role-definitions/', params);
  }

  async createRoleDefinition(payload: CreateRoleDefinitionPayload): Promise<RoleDefinition> {
    return api.post<RoleDefinition>('/organization/role-definitions/', payload);
  }

  async updateRoleDefinition(id: string, payload: Partial<CreateRoleDefinitionPayload>): Promise<RoleDefinition> {
    return api.patch<RoleDefinition>(`/organization/role-definitions/${id}/`, payload);
  }

  // Assignments
  async getAssignments(filters: AssignmentFilters = {}): Promise<PaginatedResponse<Assignment>> {
    const params: Record<string, string> = {};
    if (filters.user) params.user = filters.user;
    if (filters.institution) params.institution = filters.institution;
    if (filters.organizationalUnit) params.organizational_unit = filters.organizationalUnit;
    if (filters.position) params.position = filters.position;
    if (filters.roleDefinition) params.role_definition = filters.roleDefinition;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<Assignment>>('/organization/assignments/', params);
  }

  async createAssignment(payload: CreateAssignmentPayload): Promise<Assignment> {
    return api.post<Assignment>('/organization/assignments/', payload);
  }

  async updateAssignment(id: string, payload: Partial<CreateAssignmentPayload>): Promise<Assignment> {
    return api.patch<Assignment>(`/organization/assignments/${id}/`, payload);
  }

  // Structure Permission Rules
  async getStructureRules(filters: StructureRuleFilters = {}): Promise<PaginatedResponse<StructurePermissionRule>> {
    const params: Record<string, string> = {};
    if (filters.institution) params.institution = filters.institution;
    if (filters.roleDefinition) params.role_definition = filters.roleDefinition;
    if (filters.action) params.action = filters.action;
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();
    if (filters.page) params.page = filters.page.toString();
    
    return api.get<PaginatedResponse<StructurePermissionRule>>('/organization/structure-permission-rules/', params);
  }

  async createStructureRule(payload: CreateStructureRulePayload): Promise<StructurePermissionRule> {
    return api.post<StructurePermissionRule>('/organization/structure-permission-rules/', payload);
  }

  async updateStructureRule(id: string, payload: Partial<CreateStructureRulePayload>): Promise<StructurePermissionRule> {
    return api.patch<StructurePermissionRule>(`/organization/structure-permission-rules/${id}/`, payload);
  }
}

export const organizationService = new OrganizationService();
