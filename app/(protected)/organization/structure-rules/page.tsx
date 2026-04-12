'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StructurePermissionRule, RoleDefinition, UnitType } from '@/types';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import Link from 'next/link';

export default function StructureRulesPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<StructurePermissionRule[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<StructurePermissionRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});

  const institutionId = user?.institution_id || '';

  const loadRules = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [rulesResponse, rolesResponse, typesResponse] = await Promise.all([
        organizationService.getStructureRules({
          institution: institutionId,
          roleDefinition: filters.roleDefinition as string | undefined,
          action: filters.action as string | undefined,
          isActive: filters.isActive as boolean | undefined,
        }),
        organizationService.getRoleDefinitions({ institution: institutionId }),
        organizationService.getUnitTypes({ institution: institutionId }),
      ]);
      setRules(rulesResponse.results);
      setRoleDefinitions(rolesResponse.results);
      setUnitTypes(typesResponse.results);
    } catch {
      setError('فشل تحميل قواعد الهيكل');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.roleDefinition, filters.action, filters.isActive]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.createStructureRule({
        institution: institutionId,
        role_definition: data.role_definition as string,
        action: data.action as string,
        target_unit_type: data.target_unit_type as string | undefined,
        allowed_parent_unit_type: data.allowed_parent_unit_type as string | undefined,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadRules();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء القاعدة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingRule) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.updateStructureRule(editingRule.id, {
        role_definition: data.role_definition as string,
        action: data.action as string,
        target_unit_type: data.target_unit_type as string | undefined,
        allowed_parent_unit_type: data.allowed_parent_unit_type as string | undefined,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingRule(null);
      loadRules();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث القاعدة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rule: StructurePermissionRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const columns: Column<StructurePermissionRule>[] = [
    { key: 'role_definition_name', header: 'الدور' },
    { key: 'action', header: 'الإجراء' },
    { key: 'target_unit_type_name', header: 'نوع الوحدة المستهدفة', render: (item) => item.target_unit_type_name || 'أي' },
    { key: 'allowed_parent_unit_type_name', header: 'الوحدة الأم المسموحة', render: (item) => item.allowed_parent_unit_type_name || 'أي' },
    { key: 'is_active', header: 'نشط', render: (item) => (item.is_active ? 'نعم' : 'لا') },
  ];

  const filterFields = [
    {
      key: 'roleDefinition',
      label: 'الدور',
      type: 'select' as const,
      options: roleDefinitions.map((r) => ({ value: r.id, label: r.name })),
    },
    { key: 'action', label: 'الإجراء', type: 'text' as const },
    { key: 'isActive', label: 'نشط فقط', type: 'checkbox' as const },
  ];

  const actionOptions = [
    { value: 'create', label: 'إنشاء' },
    { value: 'update', label: 'تحديث' },
    { value: 'delete', label: 'حذف' },
    { value: 'view', label: 'عرض' },
    { value: 'manage', label: 'إدارة' },
  ];

  const unitTypeOptions = [{ value: '', label: 'أي' }, ...unitTypes.map((t) => ({ value: t.id, label: t.name }))];
  const roleOptions = roleDefinitions.map((r) => ({ value: r.id, label: r.name }));

  const formFields = [
    {
      key: 'role_definition',
      label: 'تعريف الدور',
      type: 'select' as const,
      required: true,
      options: roleOptions,
    },
    {
      key: 'action',
      label: 'الإجراء',
      type: 'select' as const,
      required: true,
      options: actionOptions,
    },
    {
      key: 'target_unit_type',
      label: 'نوع الوحدة المستهدفة',
      type: 'select' as const,
      options: unitTypeOptions,
    },
    {
      key: 'allowed_parent_unit_type',
      label: 'نوع الوحدة الأم المسموح',
      type: 'select' as const,
      options: unitTypeOptions,
    },
    { key: 'is_active', label: 'نشط', type: 'checkbox' as const },
  ];

  return (
    <div>
      <PageHeader title="قواعد صلاحيات الهيكل" subtitle="إدارة قواعد صلاحيات الهيكل" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/organization" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى الهيكل التنظيمي
        </Link>
        <button
          onClick={() => {
            setEditingRule(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء قاعدة
        </button>
      </div>

      <div className="mb-4">
        <FilterBar fields={filterFields} onFilter={setFilters} initialFilters={filters} />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <EntityTable
        columns={columns}
        data={rules}
        keyExtractor={(item) => item.id}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <EntityFormModal
        key={`${editingRule?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
          setFormErrors({});
        }}
        title={editingRule ? 'تعديل القاعدة' : 'إنشاء قاعدة'}
        fields={formFields}
        initialData={editingRule ? {
          role_definition: editingRule.role_definition,
          action: editingRule.action,
          target_unit_type: editingRule.target_unit_type || '',
          allowed_parent_unit_type: editingRule.allowed_parent_unit_type || '',
          is_active: editingRule.is_active,
        } : { is_active: true, target_unit_type: '', allowed_parent_unit_type: '' }}
        onSubmit={editingRule ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
