// Auth Types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  institution_id?: string | null;
  institution_name: string | null;
  user_category?: UserCategory;
  profile_image?: string | null;
}

export type UserCategory = 'teaching' | 'staff';

// Institution Users
export interface InstitutionUser {
  id: string;
  institution: string;
  institution_name: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_category: UserCategory;
  profile_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Common
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Institution
export interface Institution {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo: string | null;
  is_active: boolean;
  dean: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// Transaction
export type TransactionStatus = 'draft' | 'submitted' | 'in_progress' | 'pending' | 'completed' | 'cancelled' | 'archived';
export type TransactionPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TransactionConfidentiality = 'normal' | 'confidential' | 'restricted';
export type SourceType = 'internal' | 'external';

export interface Transaction {
  id: string;
  institution: string;
  institution_name: string;
  transaction_type: string;
  transaction_type_name: string;
  transaction_type_code: string;
  title: string;
  subject: string;
  description: string | null;
  source_type: SourceType;
  status: TransactionStatus;
  priority: TransactionPriority;
  confidentiality: TransactionConfidentiality;
  created_by: string;
  created_by_email: string;
  created_assignment: string | null;
  created_unit: string | null;
  current_assignment: string | null;
  current_unit: string | null;
  requires_response: boolean;
  due_date: string | null;
  is_print_ready: boolean;
  is_archived: boolean;
  external_reference: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionType {
  id: string;
  institution: string;
  institution_name: string;
  code: string;
  name: string;
  description: string | null;
  default_priority: TransactionPriority;
  requires_approval: boolean;
  approval_workflow: Record<string, unknown> | null;
  is_active: boolean;
}

// Routing
export type RouteType = 'forward' | 'return' | 'referral';
export type RoutingStatus = 'sent' | 'received' | 'completed' | 'rejected';
export type TargetMode = 'user' | 'unit' | 'assignment' | 'committee';

export interface RoutingAction {
  id: string;
  institution: string;
  institution_name: string;
  transaction: string;
  transaction_title: string;
  route_type: RouteType;
  target_mode: TargetMode;
  from_assignment: string | null;
  from_unit: string | null;
  to_user: string | null;
  to_unit: string | null;
  to_assignment: string | null;
  to_committee: string | null;
  margin_note: string | null;
  sent_by: string;
  sent_by_email: string;
  status: RoutingStatus;
  sent_at: string;
  received_at: string | null;
  completed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Approvals
export type DecisionType = 'approved' | 'rejected' | 'returned' | 'delegated';
export type SignatureMethod = 'wet_ink' | 'digital' | 'system_recorded';
export type SignatureStatus = 'pending' | 'signed' | 'waived';

export interface ApprovalAction {
  id: string;
  institution: string;
  institution_name: string;
  transaction: string;
  transaction_title: string;
  routing_action: string | null;
  acted_by: string;
  acted_by_email: string;
  acted_assignment: string;
  decision: DecisionType;
  decision_note: string | null;
  signature_method: SignatureMethod;
  signature_status: SignatureStatus;
  signed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Registry
export interface IncomingRegistry {
  id: string;
  institution: string;
  institution_name: string;
  transaction: string;
  transaction_title: string;
  registry_year: number;
  sequence_number: number;
  registry_number_display: string;
  registered_by: string;
  registered_by_email: string;
  registered_assignment: string;
  registered_unit: string;
  received_date: string;
  sender_name: string | null;
  external_reference: string | null;
  subject_snapshot: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutgoingRegistry {
  id: string;
  institution: string;
  institution_name: string;
  transaction: string;
  transaction_title: string;
  registry_year: number;
  sequence_number: number;
  registry_number_display: string;
  registered_by: string;
  registered_by_email: string;
  registered_assignment: string;
  registered_unit: string;
  sent_date: string;
  recipient_name: string | null;
  external_reference: string | null;
  dispatch_method: string | null;
  tracking_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Print Dispatch
export type PrintDispatchStatus = 
  | 'ready_for_print'
  | 'prepared'
  | 'printed'
  | 'delivered_for_signature'
  | 'wet_signed'
  | 'delivered_to_registry'
  | 'dispatched';

export interface PrintDispatch {
  id: string;
  institution: string;
  institution_name: string;
  transaction: string;
  transaction_title: string;
  status: PrintDispatchStatus;
  prepared_at: string | null;
  prepared_by: string | null;
  printed_at: string | null;
  printed_by: string | null;
  delivered_for_signature_at: string | null;
  wet_signed_at: string | null;
  wet_signed_by: string | null;
  delivered_to_registry_at: string | null;
  delivered_to_registry_by: string | null;
  dispatch_reference: string | null;
  dispatch_notes: string | null;
  dispatched_at: string | null;
  dispatched_by: string | null;
  created_at: string;
  updated_at: string;
}

// Attachments
export interface AttachmentCategory {
  id: string;
  institution: string;
  institution_name: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface Attachment {
  id: string;
  institution: string;
  institution_name: string;
  transaction: string;
  transaction_title: string;
  attachment_category: string | null;
  category_name: string | null;
  category_code: string | null;
  file: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  description: string | null;
  uploaded_by: string;
  uploaded_by_email: string;
  uploaded_assignment: string | null;
  uploaded_unit: string | null;
  uploaded_unit_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Notifications
export type NotificationCategory = 
  | 'routing_received'
  | 'routing_returned'
  | 'approval_required'
  | 'approved'
  | 'rejected'
  | 'registry_incoming'
  | 'dispatch_stage';

export interface Notification {
  id: string;
  institution: string;
  institution_name: string;
  recipient: string;
  recipient_email: string;
  category: NotificationCategory;
  title: string;
  message: string;
  related_transaction: string | null;
  related_transaction_title: string | null;
  is_read: boolean;
  read_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Audit Logs
export interface AuditLog {
  id: string;
  institution: string;
  institution_name: string;
  actor: string;
  actor_email: string;
  action: string;
  object_type: string;
  object_id: string;
  object_repr: string;
  related_transaction: string | null;
  related_transaction_title: string | null;
  details: Record<string, unknown> | null;
  previous_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Reports
export interface TransactionSummaryReport {
  counts: {
    total: number;
    draft: number;
    submitted: number;
    in_progress: number;
    pending: number;
    completed: number;
    cancelled: number;
    archived: number;
  };
  by_institution: Array<{
    institution_id: string;
    institution_name: string;
    count: number;
  }>;
}

export interface RegistrySummaryReport {
  counts: {
    total_incoming: number;
    total_outgoing: number;
    current_year_incoming: number;
    current_year_outgoing: number;
    year: number;
  };
  incoming_by_institution: Array<{
    institution_id: string;
    institution_name: string;
    count: number;
  }>;
  outgoing_by_institution: Array<{
    institution_id: string;
    institution_name: string;
    count: number;
  }>;
}

export interface WorkflowSummaryReport {
  counts: {
    routing: number;
    approval: number;
    print_dispatch: number;
    unread_notifications: number;
  };
}

export interface MySummaryReport {
  counts: {
    my_created_transactions: number;
    my_pending_routed_items: number;
    my_unread_notifications: number;
    my_recent_approvals: number;
    my_recent_dispatch_related: number;
  };
  window_days: number;
}

// Organization
export interface UnitType {
  id: string;
  institution: string;
  institution_name: string;
  code: string;
  name: string;
  description: string | null;
  level: number;
  is_active: boolean;
}

export interface Unit {
  id: string;
  institution: string;
  institution_name: string;
  unit_type: string;
  unit_type_name: string;
  name: string;
  code: string;
  parent: string | null;
  parent_name: string | null;
  description: string | null;
  is_active: boolean;
  handles_incoming_outgoing: boolean;
  created_at: string;
  updated_at: string;
}

export interface PositionType {
  id: string;
  institution: string;
  institution_name: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface Position {
  id: string;
  institution: string;
  institution_name: string;
  position_type: string;
  position_type_name: string;
  unit: string;
  unit_name: string;
  title: string;
  code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleDefinition {
  id: string;
  institution: string;
  institution_name: string;
  code: string;
  name: string;
  description: string | null;
  can_create_transactions: boolean;
  can_approve: boolean;
  can_route: boolean;
  can_manage_registry: boolean;
  is_active: boolean;
}

export interface Assignment {
  id: string;
  institution: string;
  institution_name: string;
  user: string;
  user_email: string;
  user_full_name: string;
  position: string;
  position_title: string;
  unit: string;
  unit_name: string;
  role: string | null;
  role_name: string | null;
  is_primary: boolean;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnitTreeNode {
  id: string;
  name: string;
  code: string;
  unit_type: string;
  unit_type_name: string;
  is_active: boolean;
  children: UnitTreeNode[];
}

export interface StructurePermissionRule {
  id: string;
  institution: string;
  institution_name: string;
  role_definition: string;
  role_definition_name: string;
  action: string;
  target_unit_type: string | null;
  target_unit_type_name: string | null;
  allowed_parent_unit_type: string | null;
  allowed_parent_unit_type_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Committees
export interface CommitteeType {
  id: string;
  institution: string;
  institution_name: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface Committee {
  id: string;
  institution: string;
  institution_name: string;
  committee_type: string;
  committee_type_name: string;
  name: string;
  code: string;
  description: string | null;
  scope_unit: string | null;
  scope_unit_name: string | null;
  is_permanent: boolean;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'inactive' | 'dissolved';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommitteeMember {
  id: string;
  institution: string;
  institution_name: string;
  committee: string;
  committee_name: string;
  assignment: string;
  member_email: string;
  member_name: string;
  role: 'chair' | 'vice_chair' | 'secretary' | 'member';
  joined_at: string;
  is_active: boolean;
}
