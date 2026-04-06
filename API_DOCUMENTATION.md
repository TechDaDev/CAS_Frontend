# OMS API Documentation

## Base URL

For now, use the Django server URL as base.

- Local example: http://127.0.0.1:8000
- API base prefix: /api/

Full URL pattern:

- {DJANGO_SERVER_URL}/api/{endpoint}

Example:

- http://127.0.0.1:8000/api/transactions/

## Table of Contents

1. [Authentication](#authentication)
2. [Institution Users](#institution-users)
3. [System](#system)
4. [Institutions](#institutions)
5. [Organization](#organization)
6. [Committees](#committees)
7. [Transactions](#transactions)
8. [Routing](#routing)
9. [Approvals](#approvals)
10. [Registry and Print Dispatch](#registry-and-print-dispatch)
11. [Notifications](#notifications)
12. [Audit Logs](#audit-logs)
13. [Reports](#reports)
14. [Common Notes](#common-notes)

## Authentication

### POST /api/auth/login/

- Note: Obtain JWT access and refresh tokens.

Request body:

```json
{
  "email": "admin@oms.local",
  "password": "AdminPass!2026"
}
```

Response body:

```json
{
  "refresh": "<jwt-refresh-token>",
  "access": "<jwt-access-token>"
}
```

### POST /api/auth/refresh/

- Note: Refresh access token.

Request body:

```json
{
  "refresh": "<jwt-refresh-token>"
}
```

Response body:

```json
{
  "access": "<new-jwt-access-token>"
}
```

### GET /api/auth/me/

- Note: Returns authenticated user profile.

Request body: none

Response body:

```json
{
  "id": "uuid",
  "email": "admin@oms.local",
  "first_name": "Admin",
  "last_name": "User",
  "is_active": true,
  "is_staff": true,
  "is_superuser": true,
  "institution_id": null,
  "institution_name": null
}
```

## Institution Users

### Endpoints

- GET /api/accounts/institution-users/
- POST /api/accounts/institution-users/
- GET /api/accounts/institution-users/{id}/
- PATCH /api/accounts/institution-users/{id}/

### POST /api/accounts/institution-users/

- Note: Creates user + profile atomically.
- Note: Allowed for platform super admin, institution dean, or delegated members with `create_institution_user` structure rule.
- Note: `institution` is optional for dean/delegated users with a single scoped institution, but required for superuser and multi-institution actors.

Request body:

```json
{
  "institution": "uuid",
  "email": "teacher1@example.edu",
  "password": "StrongPassword123",
  "first_name": "Ana",
  "last_name": "Teacher",
  "user_category": "teaching",
  "is_active": true
}
```

Request body (multipart with optional profile image):

- institution: uuid (optional in scoped cases)
- email: string
- password: string
- first_name: string
- last_name: string
- user_category: teaching | staff
- profile_image: image file (optional)
- is_active: boolean (optional)

Response body:

```json
{
  "id": "uuid",
  "email": "teacher1@example.edu",
  "first_name": "Ana",
  "last_name": "Teacher",
  "is_active": true,
  "user_category": "teaching",
  "profile_image": "http://127.0.0.1:8000/media/users/.../profile/....gif",
  "profile_institution": "uuid",
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

### PATCH /api/accounts/institution-users/{id}/

- Note: Limited updates only (first_name, last_name, is_active, user_category, profile_image).

Request body (json):

```json
{
  "first_name": "Updated",
  "user_category": "staff",
  "is_active": true
}
```

Request body (multipart for profile image update):

- first_name: string (optional)
- last_name: string (optional)
- is_active: boolean (optional)
- user_category: teaching | staff (optional)
- profile_image: image file or null (optional)

## System

### GET /api/health/

- Note: Health endpoint for service checks.

Request body: none

Response body:

```json
{
  "status": "ok",
  "service": "oms-backend"
}
```

## Institutions

### Endpoints

- GET /api/institutions/
- POST /api/institutions/
- GET /api/institutions/{id}/
- PATCH /api/institutions/{id}/
- POST /api/institutions/{id}/assign-dean/

### POST /api/institutions/

- Note: Create institution (platform super admin).

Request body:

```json
{
  "name": "Workflow College",
  "slug": "workflow-college",
  "code": "WCOL",
  "description": "Main institution",
  "address": "Campus Road",
  "contact_email": "admin@wcol.edu",
  "contact_phone": "+1234567",
  "is_active": true
}
```

Response body:

```json
{
  "id": "uuid",
  "name": "Workflow College",
  "slug": "workflow-college",
  "code": "WCOL",
  "description": "Main institution",
  "address": "Campus Road",
  "contact_email": "admin@wcol.edu",
  "contact_phone": "+1234567",
  "logo": null,
  "is_active": true,
  "dean": null,
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

### PATCH /api/institutions/{id}/

- Note: Supports institution logo upload (dean of own institution or platform super admin).

Request body (multipart):

- logo: image file

Response body includes updated `logo` URL.

### POST /api/institutions/{id}/assign-dean/

- Note: One-time dean assignment via email/password.

Request body:

```json
{
  "email": "dean@wcol.edu",
  "password": "StrongPassword123",
  "first_name": "Jane",
  "last_name": "Dean"
}
```

Response body:

```json
{
  "assigned": true,
  "institution_id": "uuid",
  "institution_name": "Workflow College",
  "dean": {
    "id": "uuid",
    "email": "dean@wcol.edu",
    "first_name": "Jane",
    "last_name": "Dean",
    "full_name": "Jane Dean"
  }
}
```

## Organization

### Endpoints

- Unit Types: GET/POST /api/organization/unit-types/, GET/PATCH /api/organization/unit-types/{id}/
- Units: GET/POST /api/organization/units/, GET/PATCH /api/organization/units/{id}/
- Unit Tree: GET /api/organization/units/tree/?institution={institution_id}
- Position Types: GET/POST /api/organization/position-types/, GET/PATCH /api/organization/position-types/{id}/
- Positions: GET/POST /api/organization/positions/, GET/PATCH /api/organization/positions/{id}/
- Role Definitions: GET/POST /api/organization/role-definitions/, GET/PATCH /api/organization/role-definitions/{id}/
- Assignments: GET/POST /api/organization/assignments/, GET/PATCH /api/organization/assignments/{id}/
- Structure Rules: GET/POST /api/organization/structure-permission-rules/, GET/PATCH /api/organization/structure-permission-rules/{id}/

### Example: POST /api/organization/units/

- Note: Create scoped organization unit.

Request body:

```json
{
  "institution": "uuid",
  "unit_type": "uuid",
  "name": "Registry Office",
  "code": "REGISTRY",
  "parent": null,
  "description": "Main registry",
  "is_active": true,
  "handles_incoming_outgoing": true
}
```

Response body:

```json
{
  "id": "uuid",
  "institution": "uuid",
  "institution_name": "Workflow College",
  "unit_type": "uuid",
  "unit_type_name": "Office",
  "name": "Registry Office",
  "code": "REGISTRY",
  "parent": null,
  "parent_name": null,
  "description": "Main registry",
  "is_active": true,
  "handles_incoming_outgoing": true,
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

## Committees

### Endpoints

- Committee Types: GET/POST /api/committees/types/, GET/PATCH /api/committees/types/{id}/
- Committees: GET/POST /api/committees/, GET/PATCH /api/committees/{id}/
- Committee Members (for one committee): GET /api/committees/{id}/members/
- Committee Members (global scoped): GET/POST /api/committees/members/, GET/PATCH /api/committees/members/{id}/

### Example: POST /api/committees/

- Note: Creates committee with scoped unit.

Request body:

```json
{
  "institution": "uuid",
  "committee_type": "uuid",
  "name": "Budget Committee",
  "code": "BCOM",
  "description": "Budget review committee",
  "scope_unit": "uuid",
  "is_permanent": true,
  "start_date": null,
  "end_date": null,
  "status": "active",
  "is_active": true
}
```

Response body:

```json
{
  "id": "uuid",
  "institution": "uuid",
  "institution_name": "Workflow College",
  "committee_type": "uuid",
  "committee_type_name": "Standing Committee",
  "name": "Budget Committee",
  "code": "BCOM",
  "description": "Budget review committee",
  "scope_unit": "uuid",
  "scope_unit_name": "Dean Office",
  "is_permanent": true,
  "start_date": null,
  "end_date": null,
  "status": "active",
  "is_active": true,
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

## Transactions

### Endpoints

- Transaction Types: GET/POST /api/transactions/types/, GET/PATCH /api/transactions/types/{id}/
- Transactions: GET/POST /api/transactions/, GET/PATCH /api/transactions/{id}/
- My Transactions: GET /api/transactions/my/
- Archive Transactions: GET /api/transactions/archive/
- Transaction Routing History: GET /api/transactions/{id}/routing-history/
- Transaction Approval History: GET /api/transactions/{id}/approval-history/
- Transaction Incoming Registry: GET /api/transactions/{id}/incoming-registry/
- Transaction Outgoing Registry: GET /api/transactions/{id}/outgoing-registry/
- Transaction Print Dispatch: GET /api/transactions/{id}/print-dispatch/
- Transaction Attachments: GET /api/transactions/{id}/attachments/
- Transaction Audit History: GET /api/transactions/{id}/audit-history/
- Attachment Categories: GET/POST /api/transactions/attachment-categories/, GET/PATCH /api/transactions/attachment-categories/{id}/
- Attachments: GET/POST /api/transactions/attachments/, GET/PATCH /api/transactions/attachments/{id}/
- Attachment Download: GET /api/transactions/attachments/{id}/download/

### POST /api/transactions/

- Note: Create transaction; created_by is auto-set from authenticated user.

Request body:

```json
{
  "institution": "uuid",
  "transaction_type": "uuid",
  "title": "Purchase Request",
  "subject": "Office supplies",
  "description": "Request for Q2 supplies",
  "source_type": "internal",
  "status": "draft",
  "priority": "normal",
  "confidentiality": "normal",
  "created_assignment": "uuid",
  "created_unit": "uuid",
  "current_assignment": "uuid",
  "current_unit": "uuid",
  "related_committee": null,
  "parent_transaction": null,
  "requires_response": false,
  "due_date": "2026-04-20",
  "is_print_ready": false,
  "is_archived": false,
  "external_reference": "EXT-100",
  "external_sender_name": "",
  "external_recipient_name": "",
  "notes": "initial draft",
  "is_active": true
}
```

Response body:

```json
{
  "id": "uuid",
  "institution": "uuid",
  "institution_name": "Workflow College",
  "transaction_type": "uuid",
  "transaction_type_name": "Internal Request",
  "transaction_type_code": "INT_REQ",
  "title": "Purchase Request",
  "subject": "Office supplies",
  "description": "Request for Q2 supplies",
  "source_type": "internal",
  "status": "draft",
  "priority": "normal",
  "confidentiality": "normal",
  "created_by": "uuid",
  "created_by_email": "staff@example.com",
  "created_assignment": "uuid",
  "created_unit": "uuid",
  "current_assignment": "uuid",
  "current_unit": "uuid",
  "requires_response": false,
  "due_date": "2026-04-20",
  "is_print_ready": false,
  "is_archived": false,
  "external_reference": "EXT-100",
  "notes": "initial draft",
  "is_active": true,
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

### POST /api/transactions/attachments/

- Note: multipart upload endpoint.

Request body (multipart/form-data):

- institution: uuid
- transaction: uuid
- attachment_category: uuid (optional)
- routing_action: uuid (optional)
- approval_action: uuid (optional)
- file: binary file
- description: string (optional)
- uploaded_assignment: uuid (optional)
- uploaded_unit: uuid (optional)
- is_active: boolean (optional)

Response body:

```json
{
  "id": "uuid",
  "institution": "uuid",
  "institution_name": "Workflow College",
  "transaction": "uuid",
  "transaction_title": "Purchase Request",
  "attachment_category": "uuid",
  "category_name": "Memo",
  "category_code": "MEMO",
  "file": "http://127.0.0.1:8000/media/...",
  "original_filename": "doc.pdf",
  "file_size": 12033,
  "mime_type": "application/pdf",
  "description": "signed copy",
  "uploaded_by": "uuid",
  "uploaded_by_email": "staff@example.com",
  "uploaded_assignment": "uuid",
  "uploaded_unit": "uuid",
  "uploaded_unit_name": "Registry Office",
  "is_active": true,
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

## Routing

### Endpoints

- GET/POST /api/routing/actions/
- GET/PATCH /api/routing/actions/{id}/
- POST /api/routing/actions/{id}/mark-received/
- POST /api/routing/actions/{id}/mark-completed/
- GET /api/routing/inbox/
- GET /api/routing/outbox/

### POST /api/routing/actions/

- Note: Creates route and updates transaction current holder based on target.

Request body:

```json
{
  "institution": "uuid",
  "transaction": "uuid",
  "route_type": "forward",
  "target_mode": "user",
  "from_assignment": "uuid",
  "from_unit": "uuid",
  "to_user": "uuid",
  "margin_note": "please review"
}
```

Response body:

```json
{
  "id": "uuid",
  "institution": "uuid",
  "institution_name": "Workflow College",
  "transaction": "uuid",
  "transaction_title": "Purchase Request",
  "route_type": "forward",
  "target_mode": "user",
  "from_assignment": "uuid",
  "from_unit": "uuid",
  "to_user": "uuid",
  "sent_by": "uuid",
  "sent_by_email": "staff@example.com",
  "status": "sent",
  "sent_at": "2026-04-06T00:00:00Z",
  "received_at": null,
  "completed_at": null,
  "is_active": true,
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

## Approvals

### Endpoints

- GET/POST /api/approvals/actions/
- GET/PATCH /api/approvals/actions/{id}/

### POST /api/approvals/actions/

- Note: Records decision, may update transaction status depending on decision.

Request body:

```json
{
  "institution": "uuid",
  "transaction": "uuid",
  "routing_action": null,
  "acted_assignment": "uuid",
  "decision": "approved",
  "decision_note": "Approved for processing",
  "signature_method": "system_recorded",
  "signature_status": "pending"
}
```

Response body:

```json
{
  "id": "uuid",
  "institution": "uuid",
  "institution_name": "Workflow College",
  "transaction": "uuid",
  "transaction_title": "Purchase Request",
  "routing_action": null,
  "acted_by": "uuid",
  "acted_by_email": "staff@example.com",
  "acted_assignment": "uuid",
  "decision": "approved",
  "decision_note": "Approved for processing",
  "signature_method": "system_recorded",
  "signature_status": "pending",
  "signed_at": null,
  "is_active": true,
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

## Registry and Print Dispatch

### Endpoints

Incoming registry:
- GET/POST /api/registry/incoming/
- GET/PATCH /api/registry/incoming/{id}/

Outgoing registry:
- GET/POST /api/registry/outgoing/
- GET/PATCH /api/registry/outgoing/{id}/

Print dispatch:
- GET/POST /api/registry/print-dispatch/
- GET /api/registry/print-dispatch/{id}/
- POST /api/registry/print-dispatch/{id}/mark-ready-for-print/
- POST /api/registry/print-dispatch/{id}/mark-prepared/
- POST /api/registry/print-dispatch/{id}/mark-printed/
- POST /api/registry/print-dispatch/{id}/mark-delivered-for-signature/
- POST /api/registry/print-dispatch/{id}/mark-wet-signed/
- POST /api/registry/print-dispatch/{id}/mark-delivered-to-registry/
- POST /api/registry/print-dispatch/{id}/mark-dispatched/

### POST /api/registry/incoming/

- Note: Auto-generates registry year/sequence/display number.

Request body:

```json
{
  "institution": "uuid",
  "transaction": "uuid",
  "registered_assignment": "uuid",
  "registered_unit": "uuid",
  "received_date": "2026-04-06",
  "sender_name": "Ministry",
  "external_reference": "MOE-900",
  "subject_snapshot": "Budget clarification",
  "notes": "received at front desk"
}
```

Response body:

```json
{
  "id": "uuid",
  "institution": "uuid",
  "institution_name": "Workflow College",
  "transaction": "uuid",
  "transaction_title": "Incoming Memo",
  "registry_year": 2026,
  "sequence_number": 1,
  "registry_number_display": "IN-2026-000001",
  "registered_by": "uuid",
  "registered_by_email": "staff@example.com",
  "registered_assignment": "uuid",
  "registered_unit": "uuid",
  "received_date": "2026-04-06",
  "sender_name": "Ministry",
  "external_reference": "MOE-900",
  "subject_snapshot": "Budget clarification",
  "notes": "received at front desk",
  "is_active": true,
  "created_at": "2026-04-06T00:00:00Z",
  "updated_at": "2026-04-06T00:00:00Z"
}
```

### POST /api/registry/print-dispatch/{id}/mark-dispatched/

- Note: Stage transition endpoint.

Request body:

```json
{
  "acted_assignment": "uuid",
  "dispatch_reference": "DSP-2026-001",
  "dispatch_notes": "Released to external courier"
}
```

Response body:

```json
{
  "id": "uuid",
  "status": "dispatched",
  "dispatch_reference": "DSP-2026-001",
  "dispatch_notes": "Released to external courier",
  "dispatched_by": "uuid",
  "dispatched_assignment": "uuid",
  "dispatched_at": "2026-04-06T00:00:00Z"
}
```

## Notifications

### Endpoints

- GET /api/notifications/
- GET /api/notifications/{id}/
- POST /api/notifications/{id}/mark-read/
- POST /api/notifications/mark-all-read/

### GET /api/notifications/

- Note: Returns only the current user notifications.

Request body: none

Response body (paginated):

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "institution": "uuid",
      "institution_name": "Workflow College",
      "recipient": "uuid",
      "recipient_email": "staff@example.com",
      "category": "routing_received",
      "title": "New routing",
      "message": "You received a routed transaction",
      "related_transaction": "uuid",
      "is_read": false,
      "read_at": null,
      "is_active": true,
      "created_at": "2026-04-06T00:00:00Z",
      "updated_at": "2026-04-06T00:00:00Z"
    }
  ]
}
```

### POST /api/notifications/mark-all-read/

- Note: Marks unread notifications owned by current user.

Request body: none

Response body:

```json
{
  "marked_read": 2
}
```

## Audit Logs

### Endpoints

- GET /api/audit/logs/
- GET /api/audit/logs/{id}/

### GET /api/audit/logs/

- Note: Read-only endpoint; broad access restricted (superuser/dean scope).

Request body: none

Response body (paginated):

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "institution": "uuid",
      "institution_name": "Workflow College",
      "actor": "uuid",
      "actor_email": "staff@example.com",
      "action": "create",
      "object_type": "transactions.Transaction",
      "object_id": "uuid",
      "object_repr": "Purchase Request",
      "related_transaction": "uuid",
      "related_transaction_title": "Purchase Request",
      "details": {"status": "draft"},
      "previous_state": null,
      "new_state": null,
      "ip_address": null,
      "user_agent": null,
      "is_active": true,
      "created_at": "2026-04-06T00:00:00Z",
      "updated_at": "2026-04-06T00:00:00Z"
    }
  ]
}
```

## Reports

### Endpoints

- GET /api/reports/transactions/summary/
- GET /api/reports/registry/summary/
- GET /api/reports/workflow/summary/
- GET /api/reports/my-summary/

### GET /api/reports/transactions/summary/

- Note: Visibility-aware operational counts.

Request body: none

Response body:

```json
{
  "counts": {
    "total": 120,
    "draft": 8,
    "submitted": 14,
    "in_progress": 33,
    "pending": 11,
    "completed": 41,
    "cancelled": 3,
    "archived": 10
  },
  "by_institution": [
    {
      "institution_id": "uuid",
      "institution_name": "Workflow College",
      "count": 120
    }
  ]
}
```

### GET /api/reports/registry/summary/

Request body: none

Response body:

```json
{
  "counts": {
    "total_incoming": 32,
    "total_outgoing": 26,
    "current_year_incoming": 20,
    "current_year_outgoing": 15,
    "year": 2026
  },
  "incoming_by_institution": [],
  "outgoing_by_institution": []
}
```

### GET /api/reports/workflow/summary/

Request body: none

Response body:

```json
{
  "counts": {
    "routing": 80,
    "approval": 54,
    "print_dispatch": 18,
    "unread_notifications": 4
  }
}
```

### GET /api/reports/my-summary/

Request body: none

Response body:

```json
{
  "counts": {
    "my_created_transactions": 15,
    "my_pending_routed_items": 3,
    "my_unread_notifications": 2,
    "my_recent_approvals": 5,
    "my_recent_dispatch_related": 1
  },
  "window_days": 30
}
```

## Common Notes

- Most list endpoints are paginated and return: count, next, previous, results.
- Search query parameter:
  - transactions: /api/transactions/?search=...
  - incoming registry: /api/registry/incoming/?search=...
  - outgoing registry: /api/registry/outgoing/?search=...
  - attachments: /api/transactions/attachments/?search=...
- Archive endpoint:
  - /api/transactions/archive/
- Notifications are in-app only (no email/SMS/push).
- Audit logs are read-only via API.
- Standard error response shape for validation failures:

```json
{
  "field_name": ["error message"]
}
```

- Authorization header for JWT-protected endpoints:

```http
Authorization: Bearer <access-token>
```
