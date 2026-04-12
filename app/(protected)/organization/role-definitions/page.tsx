'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RoleDefinition } from '@/types';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';

export default function RoleDefinitionsPage() {
  const { user } = useAuth();
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const institutionId = user?.institution_id || '';

  const loadRoleDefinitions = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await organizationService.getRoleDefinitions({
        institution: institutionId,
        isActive: filters.isActive as boolean | undefined,
        page: currentPage,
      });
      setRoleDefinitions(response.results);
      setTotalItems(response.count);
      setHasNextPage(Boolean(response.next));
      setHasPreviousPage(Boolean(response.previous));
    } catch {
      setError('فشل تحميل تعريفات الأدوار');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.isActive, currentPage]);

  useEffect(() => {
    loadRoleDefinitions();
  }, [loadRoleDefinitions]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.createRoleDefinition({
        institution: institutionId,
        name: data.name as string,
        code: data.code as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadRoleDefinitions();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء تعريف الدور' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingRole) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.updateRoleDefinition(editingRole.id, {
        name: data.name as string,
        code: data.code as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingRole(null);
      loadRoleDefinitions();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث تعريف الدور' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (role: RoleDefinition) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const columns: Column<RoleDefinition>[] = [
    { key: 'name', header: 'الاسم' },
    { key: 'code', header: 'الرمز' },
    { key: 'description', header: 'الوصف', render: (item) => item.description || '-' },
    { key: 'can_create_transactions', header: 'إنشاء معاملة', render: (item) => (item.can_create_transactions ? 'نعم' : 'لا') },
    { key: 'can_approve', header: 'موافقة', render: (item) => (item.can_approve ? 'نعم' : 'لا') },
    { key: 'can_route', header: 'إحالة', render: (item) => (item.can_route ? 'نعم' : 'لا') },
    { key: 'is_active', header: 'نشط', render: (item) => (item.is_active ? 'نعم' : 'لا') },
  ];

  const filterFields = [
    { key: 'isActive', label: 'نشط فقط', type: 'checkbox' as const },
  ];

  const formFields = [
    { key: 'name', label: 'الاسم', type: 'text' as const, required: true },
    { key: 'code', label: 'الرمز', type: 'text' as const, required: true },
    { key: 'description', label: 'الوصف', type: 'textarea' as const },
    { key: 'is_active', label: 'نشط', type: 'checkbox' as const },
  ];

  return (
    <div>
      <PageHeader title="تعريفات الأدوار" subtitle="إعداد تعريفات الأدوار والصلاحيات" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/organization" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى الهيكل التنظيمي
        </Link>
        <button
          onClick={() => {
            setEditingRole(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء تعريف دور
        </button>
      </div>

      <div className="mb-4">
        <FilterBar
          fields={filterFields}
          onFilter={(nextFilters) => {
            setCurrentPage(1);
            setFilters(nextFilters);
          }}
          initialFilters={filters}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <EntityTable
        columns={columns}
        data={roleDefinitions}
        keyExtractor={(item) => item.id}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <PaginationControls
        currentPage={currentPage}
        totalItems={totalItems}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      <EntityFormModal
        key={`${editingRole?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRole(null);
          setFormErrors({});
        }}
        title={editingRole ? 'تعديل تعريف الدور' : 'إنشاء تعريف دور'}
        fields={formFields}
        initialData={editingRole ? {
          name: editingRole.name,
          code: editingRole.code,
          description: editingRole.description || '',
          is_active: editingRole.is_active,
        } : { is_active: true }}
        onSubmit={editingRole ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
