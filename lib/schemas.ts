import { z } from 'zod';

const nullableString = z.string().nullable();
const optionalNullableString = z.string().nullable().optional();

export const UserCategorySchema = z.enum(['teaching', 'staff']);

export const AuthTokensSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
});

export const AuthRefreshSchema = z.object({
  access: z.string().min(1),
});

export const TransactionWorkflowSnapshotSchema = z.object({
  incoming_registry_number: optionalNullableString,
  outgoing_registry_number: optionalNullableString,
  print_dispatch_status: optionalNullableString,
  attachment_count: z.number().int().nonnegative().optional(),
  last_activity_at: optionalNullableString,
  current_route_id: optionalNullableString,
  last_approval_id: optionalNullableString,
});

export const TransactionAccessSummarySchema = z.object({
  can_create_transaction: z.boolean().optional(),
  can_update_transaction: z.boolean().optional(),
  can_route_transaction: z.boolean().optional(),
  can_approve_transaction: z.boolean().optional(),
  can_register_incoming: z.boolean().optional(),
  can_register_outgoing: z.boolean().optional(),
  can_prepare_print: z.boolean().optional(),
  can_record_wet_signature: z.boolean().optional(),
  can_record_dispatch: z.boolean().optional(),
  can_upload_attachment: z.boolean().optional(),
  can_view_attachment: z.boolean().optional(),
  can_manage_institution_users: z.boolean().optional(),
  can_view_audit: z.boolean().optional(),
  can_view_reports: z.boolean().optional(),
}).partial();

export const CurrentUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  is_active: z.boolean(),
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
  institution_id: optionalNullableString,
  institution_name: nullableString,
  profile_institution: optionalNullableString,
  user_category: UserCategorySchema.nullable().optional(),
  profile_image: optionalNullableString,
  permissions: z.array(z.string()).optional(),
  access_summary: TransactionAccessSummarySchema.optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    count: z.number().int().nonnegative(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });

export const TransactionSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string(),
  transaction_type: z.string().min(1),
  transaction_type_name: z.string(),
  transaction_type_code: z.string().nullable().optional(),
  title: z.string(),
  subject: z.string(),
  description: nullableString,
  source_type: z.enum(['external_incoming', 'external_outgoing', 'internal', 'committee', 'response']),
  status: z.enum(['draft', 'submitted', 'in_progress', 'pending', 'completed', 'cancelled', 'archived']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  confidentiality: z.enum(['normal', 'confidential', 'restricted']),
  created_by: z.string().min(1),
  created_by_email: z.string().nullable().optional(),
  created_assignment: nullableString,
  created_unit: nullableString,
  created_unit_name: optionalNullableString,
  current_assignment: nullableString,
  current_unit: nullableString,
  current_unit_name: optionalNullableString,
  requires_response: z.boolean(),
  due_date: nullableString,
  is_print_ready: z.boolean(),
  is_archived: z.boolean(),
  external_reference: nullableString,
  external_sender_name: optionalNullableString,
  external_recipient_name: optionalNullableString,
  notes: nullableString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  incoming_registry_number: optionalNullableString,
  outgoing_registry_number: optionalNullableString,
  print_dispatch_status: optionalNullableString,
  attachment_count: z.number().int().nonnegative().optional(),
  last_activity_at: optionalNullableString,
  current_route_id: optionalNullableString,
  last_approval_id: optionalNullableString,
  workflow_snapshot: TransactionWorkflowSnapshotSchema.optional(),
  access_summary: TransactionAccessSummarySchema.optional(),
});

export const RoutingActionSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string(),
  transaction: z.string().min(1),
  transaction_title: z.string(),
  route_type: z.enum(['forward', 'return', 'escalate', 'assign', 'refer']),
  target_mode: z.enum(['user', 'unit', 'assignment', 'committee']),
  from_assignment: nullableString,
  from_unit: nullableString,
  to_user: nullableString,
  to_unit: nullableString,
  to_assignment: nullableString,
  to_committee: nullableString,
  margin_note: nullableString,
  sent_by: z.string().min(1),
  sent_by_email: z.string().nullable().optional(),
  status: z.enum(['sent', 'received', 'completed', 'cancelled']),
  sent_at: z.string(),
  received_at: nullableString,
  completed_at: nullableString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ApprovalActionSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string(),
  transaction: z.string().min(1),
  transaction_title: z.string(),
  routing_action: nullableString,
  acted_by: z.string().min(1),
  acted_by_email: z.string().nullable().optional(),
  acted_assignment: z.string().min(1),
  decision: z.enum(['approved', 'rejected', 'returned', 'endorsed']),
  decision_note: nullableString,
  signature_method: z.enum(['system_recorded', 'digital', 'wet_ink']),
  signature_status: z.enum(['pending', 'signed', 'failed', 'waived']),
  signed_at: nullableString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const IncomingRegistrySchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string(),
  transaction: z.string().min(1),
  transaction_title: z.string(),
  registry_year: z.number().int(),
  sequence_number: z.number().int(),
  registry_number_display: z.string(),
  registered_by: z.string().min(1),
  registered_by_email: z.string().nullable().optional(),
  registered_assignment: z.string().min(1),
  registered_unit: z.string().min(1),
  received_date: z.string(),
  sender_name: nullableString,
  external_reference: nullableString,
  subject_snapshot: nullableString,
  notes: nullableString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const OutgoingRegistrySchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string(),
  transaction: z.string().min(1),
  transaction_title: z.string(),
  registry_year: z.number().int(),
  sequence_number: z.number().int(),
  registry_number_display: z.string(),
  registered_by: z.string().min(1),
  registered_by_email: z.string().nullable().optional(),
  registered_assignment: z.string().min(1),
  registered_unit: z.string().min(1),
  registered_date: z.string(),
  recipient_name: nullableString,
  external_reference: nullableString,
  subject_snapshot: nullableString,
  notes: nullableString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PrintDispatchSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string().optional(),
  transaction: z.string().min(1),
  transaction_title: z.string().optional(),
  status: z.enum([
    'ready_for_print',
    'prepared',
    'printed',
    'delivered_for_signature',
    'wet_signed',
    'delivered_to_registry',
    'dispatched',
    'cancelled',
  ]),
  prepared_at: nullableString.optional(),
  prepared_by: nullableString.optional(),
  printed_at: nullableString.optional(),
  printed_by: nullableString.optional(),
  delivered_for_signature_at: nullableString.optional(),
  delivered_for_signature_by: nullableString.optional(),
  wet_signed_at: nullableString.optional(),
  wet_signed_by: nullableString.optional(),
  delivered_to_registry_at: nullableString.optional(),
  delivered_to_registry_by: nullableString.optional(),
  dispatch_reference: nullableString.optional(),
  dispatch_notes: nullableString.optional(),
  dispatched_at: nullableString.optional(),
  dispatched_by: nullableString.optional(),
  cancelled_at: nullableString.optional(),
  cancelled_by: nullableString.optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AttachmentExtractionSchema = z.object({
  id: z.string().min(1).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  extracted_at: nullableString.optional(),
  error_message: nullableString.optional(),
  extracted_text: nullableString.optional(),
  extracted_metadata: z.record(z.unknown()).nullable().optional(),
});

export const AttachmentSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string(),
  transaction: z.string().min(1),
  transaction_title: z.string(),
  attachment_category: nullableString,
  category_name: nullableString,
  category_code: nullableString,
  file: z.string().nullable().optional(),
  original_filename: z.string(),
  file_size: z.number().int().nonnegative(),
  mime_type: z.string(),
  description: nullableString,
  uploaded_by: z.string().min(1),
  uploaded_by_email: z.string().nullable().optional(),
  uploaded_assignment: nullableString,
  uploaded_unit: nullableString,
  uploaded_unit_name: nullableString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  extraction: AttachmentExtractionSchema.optional(),
  extraction_status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  extracted_at: nullableString.optional(),
  extraction_error_message: nullableString.optional(),
  extracted_text: nullableString.optional(),
  extracted_metadata: z.record(z.unknown()).nullable().optional(),
});

export const NotificationSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string(),
  recipient: z.string().min(1),
  recipient_email: z.string().nullable().optional(),
  category: z.enum([
    'routing_received',
    'routing_completed',
    'approval_recorded',
    'registry_registered',
    'dispatch_updated',
    'attachment_uploaded',
    'general',
  ]),
  title: z.string(),
  message: z.string(),
  related_transaction: nullableString,
  related_transaction_title: nullableString.optional(),
  is_read: z.boolean(),
  read_at: nullableString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  idempotency_key: z.string().optional(),
});

export const AuditLogSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  institution_name: z.string(),
  actor: z.string().nullable().optional(),
  actor_email: z.string().nullable().optional(),
  action: z.string(),
  object_type: z.string(),
  object_id: z.string(),
  object_repr: z.string(),
  related_transaction: nullableString,
  related_transaction_title: nullableString.optional(),
  details: z.record(z.unknown()).nullable(),
  previous_state: z.record(z.unknown()).nullable(),
  new_state: z.record(z.unknown()).nullable(),
  ip_address: nullableString,
  user_agent: nullableString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TransactionSummaryReportSchema = z.object({
  counts: z.object({
    total: z.number().int(),
    draft: z.number().int(),
    submitted: z.number().int(),
    in_progress: z.number().int(),
    pending: z.number().int(),
    completed: z.number().int(),
    cancelled: z.number().int(),
    archived: z.number().int(),
  }),
  by_institution: z.array(
    z.object({
      institution_id: z.string(),
      institution_name: z.string(),
      count: z.number().int(),
    })
  ),
});

export const RegistrySummaryReportSchema = z.object({
  counts: z.object({
    total_incoming: z.number().int(),
    total_outgoing: z.number().int(),
    current_year_incoming: z.number().int(),
    current_year_outgoing: z.number().int(),
    year: z.number().int(),
  }),
  incoming_by_institution: z.array(
    z.object({
      institution_id: z.string(),
      institution_name: z.string(),
      count: z.number().int(),
    })
  ),
  outgoing_by_institution: z.array(
    z.object({
      institution_id: z.string(),
      institution_name: z.string(),
      count: z.number().int(),
    })
  ),
});

export const WorkflowSummaryReportSchema = z.object({
  counts: z.object({
    routing: z.number().int(),
    approval: z.number().int(),
    print_dispatch: z.number().int(),
    unread_notifications: z.number().int(),
  }),
});

export const MySummaryReportSchema = z.object({
  counts: z.object({
    my_created_transactions: z.number().int(),
    my_pending_routed_items: z.number().int(),
    my_unread_notifications: z.number().int(),
    my_recent_approvals: z.number().int(),
    my_recent_dispatch_related: z.number().int(),
  }),
  window_days: z.number().int(),
});