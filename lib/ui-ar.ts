// Centralized Arabic UI labels
// Use these constants instead of hardcoded Arabic text throughout the app

export const uiLabels = {
  // Navigation
  dashboard: 'لوحة التحكم',
  transactions: 'المعاملات',
  routing: 'الإحالات',
  approvals: 'الموافقات',
  registry: 'السجل',
  printDispatch: 'الطباعة والإرسال',
  notifications: 'الإشعارات',
  organization: 'الهيكل التنظيمي',
  committees: 'اللجان',
  audit: 'سجل التدقيق',
  reports: 'التقارير',

  // Common actions
  create: 'إنشاء',
  edit: 'تعديل',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  close: 'إغلاق',
  search: 'بحث',
  filter: 'تصفية',
  clearFilters: 'مسح التصفية',
  submit: 'إرسال',
  back: 'رجوع',
  view: 'عرض',
  download: 'تنزيل',
  upload: 'رفع',
  refresh: 'تحديث',
  loading: 'جارٍ التحميل...',
  more: 'المزيد',
  less: 'أقل',

  // States
  noData: 'لا توجد بيانات',
  emptyState: 'لا يوجد محتوى لعرضه',
  loadingData: 'جارٍ تحميل البيانات...',
  errorLoading: 'حدث خطأ أثناء تحميل البيانات',
  accessDenied: 'لا تملك صلاحية الوصول',
  accessDeniedMessage: 'لا تملك صلاحية الوصول إلى هذه الصفحة',
  notFound: 'غير موجود',
  tryAgain: 'أعد المحاولة',
  success: 'نجاح',
  error: 'خطأ',

  // Form labels
  name: 'الاسم',
  code: 'الرمز',
  description: 'الوصف',
  status: 'الحالة',
  priority: 'الأولوية',
  type: 'النوع',
  date: 'التاريخ',
  notes: 'ملاحظات',
  active: 'نشط',
  inactive: 'غير نشط',
  yes: 'نعم',
  no: 'لا',

  // Page headers suffixes
  management: 'إدارة',
  list: 'قائمة',
  details: 'تفاصيل',
  createNew: 'إنشاء جديد',
  editItem: 'تعديل',

  // Notification specific
  markAsRead: 'تحديد كمقروء',
  markAllAsRead: 'تحديد الكل كمقروء',
  unread: 'غير مقروء',
  read: 'مقروء',

  // Audit specific
  auditAction: 'الإجراء',
  auditActor: 'المستخدم',
  auditTimestamp: 'التاريخ والوقت',
  auditObject: 'الكائن',
  auditDetails: 'التفاصيل',
} as const;

// Transaction status labels
export const transactionStatusLabels: Record<string, string> = {
  draft: 'مسودة',
  submitted: 'مقدمة',
  in_progress: 'قيد الإجراء',
  pending: 'معلقة',
  completed: 'مكتملة',
  cancelled: 'ملغاة',
  archived: 'مؤرشفة',
};

// Priority labels
export const priorityLabels: Record<string, string> = {
  low: 'منخفضة',
  normal: 'عادية',
  high: 'عالية',
  urgent: 'عاجلة',
};

// Confidentiality labels
export const confidentialityLabels: Record<string, string> = {
  normal: 'عادية',
  confidential: 'سرية',
  restricted: 'مقيّدة',
};

// Source type labels
export const sourceTypeLabels: Record<string, string> = {
  internal: 'داخلي',
  external: 'خارجي',
};

// Approval decision labels
export const decisionLabels: Record<string, string> = {
  approved: 'موافق عليها',
  rejected: 'مرفوضة',
  returned: 'معادة',
  delegated: 'مفوضة',
};

// Signature method labels
export const signatureMethodLabels: Record<string, string> = {
  wet_ink: 'توقيع بالحبر',
  digital: 'توقيع إلكتروني',
  system_recorded: 'تسجيل نظامي',
};

// Signature status labels
export const signatureStatusLabels: Record<string, string> = {
  pending: 'معلق',
  signed: 'موقّع',
  waived: 'متجاوز',
};

// Route type labels
export const routeTypeLabels: Record<string, string> = {
  forward: 'إحالة',
  return: 'إرجاع',
  referral: 'إحالة اختصاص',
};

// Target mode labels
export const targetModeLabels: Record<string, string> = {
  user: 'مستخدم',
  unit: 'وحدة',
  assignment: 'تخصيص',
  committee: 'لجنة',
};

// Routing status labels
export const routingStatusLabels: Record<string, string> = {
  sent: 'مرسلة',
  received: 'مستلمة',
  completed: 'مكتملة',
  rejected: 'مرفوضة',
};

// Print/Dispatch status labels
export const printDispatchStatusLabels: Record<string, string> = {
  ready_for_print: 'جاهز للطباعة',
  prepared: 'تم التحضير',
  printed: 'تمت الطباعة',
  delivered_for_signature: 'تم التسليم للتوقيع',
  wet_signed: 'موقّع بالأصل',
  delivered_to_registry: 'تم التسليم للسجل',
  dispatched: 'تم الإرسال',
};

// Notification category labels
export const notificationCategoryLabels: Record<string, string> = {
  routing_received: 'إحالة مستلمة',
  routing_returned: 'إحالة معادة',
  approval_required: 'تتطلب موافقة',
  approved: 'تمت الموافقة',
  rejected: 'تم الرفض',
  registry_incoming: 'وارد السجل',
  dispatch_stage: 'مرحلة الإرسال',
};

// Registry type labels
export const registryTypeLabels: Record<string, string> = {
  incoming: 'وارد',
  outgoing: 'صادر',
};

// Committee member role labels
export const committeeRoleLabels: Record<string, string> = {
  chair: 'رئيس',
  vice_chair: 'نائب الرئيس',
  secretary: 'سكرتير',
  member: 'عضو',
};

// Committee status labels
export const committeeStatusLabels: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  dissolved: 'منحل',
};

// Audit action labels (common actions)
export const auditActionLabels: Record<string, string> = {
  create: 'إنشاء',
  update: 'تحديث',
  delete: 'حذف',
  view: 'عرض',
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
};

// Helper function to get label with fallback
export function getLabel(map: Record<string, string>, key: string, fallback?: string): string {
  return map[key] || fallback || key;
}
