'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Assignment, Position, Unit, RoleDefinition } from '@/types';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const institutionId = user?.institution_id || '';

  const loadAssignments = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [assignmentsResponse, positionsResponse, unitsResponse, rolesResponse] = await Promise.all([
        organizationService.getAssignments({
          institution: institutionId,
          organizationalUnit: filters.organizationalUnit as string | undefined,
          position: filters.position as string | undefined,
          roleDefinition: filters.roleDefinition as string | undefined,
          isActive: filters.isActive as boolean | undefined,
          page: currentPage,
        }),
        organizationService.getPositions({ institution: institutionId }),
        organizationService.getUnits({ institution: institutionId }),
        organizationService.getRoleDefinitions({ institution: institutionId }),
      ]);
      setAssignments(assignmentsResponse.results);
      setPositions(positionsResponse.results);
      setUnits(unitsResponse.results);
      setRoleDefinitions(rolesResponse.results);
      setTotalItems(assignmentsResponse.count);
      setHasNextPage(Boolean(assignmentsResponse.next));
      setHasPreviousPage(Boolean(assignmentsResponse.previous));
    } catch {
      setError('فشل تحميل التخصيصات');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.organizationalUnit, filters.position, filters.roleDefinition, filters.isActive, currentPage]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.createAssignment({
        user: data.user as string,
        institution: institutionId,
        organizational_unit: data.organizational_unit as string,
        position: data.position as string,
        role_definition: data.role_definition as string | undefined,
        is_primary: data.is_primary as boolean,
        is_active: data.is_active as boolean,
        start_date: data.start_date as string | undefined,
        end_date: data.end_date as string | undefined,
      });
      setIsModalOpen(false);
      loadAssignments();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء التخصيص' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingAssignment) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.updateAssignment(editingAssignment.id, {
        position: data.position as string,
        role_definition: data.role_definition as string | undefined,
        is_primary: data.is_primary as boolean,
        is_active: data.is_active as boolean,
        start_date: data.start_date as string | undefined,
        end_date: data.end_date as string | undefined,
      });
      setIsModalOpen(false);
      setEditingAssignment(null);
      loadAssignments();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث التخصيص' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const columns: Column<Assignment>[] = [
    { key: 'user_full_name', header: 'المستخدم' },
    { key: 'unit_name', header: 'الوحدة' },
    { key: 'position_title', header: 'المنصب' },
    { key: 'role_name', header: 'الدور', render: (item) => item.role_name || '-' },
    { key: 'is_primary', header: 'رئيسي', render: (item) => (item.is_primary ? 'نعم' : 'لا') },
    { key: 'is_active', header: 'نشط', render: (item) => (item.is_active ? 'نعم' : 'لا') },
  ];

  const filterFields = [
    {
      key: 'organizationalUnit',
      label: 'الوحدة',
      type: 'select' as const,
      options: units.map((u) => ({ value: u.id, label: u.name })),
    },
    {
      key: 'position',
      label: 'المنصب',
      type: 'select' as const,
      options: positions.map((p) => ({ value: p.id, label: p.title })),
    },
    {
      key: 'roleDefinition',
      label: 'الدور',
      type: 'select' as const,
      options: roleDefinitions.map((r) => ({ value: r.id, label: r.name })),
    },
    { key: 'isActive', label: 'نشط فقط', type: 'checkbox' as const },
  ];

  const formFields = [
    { key: 'user', label: 'معرف المستخدم', type: 'text' as const, required: true },
    {
      key: 'organizational_unit',
      label: 'الوحدة',
      type: 'select' as const,
      required: true,
      options: units.map((u) => ({ value: u.id, label: u.name })),
    },
    {
      key: 'position',
      label: 'المنصب',
      type: 'select' as const,
      required: true,
      options: positions.map((p) => ({ value: p.id, label: p.title })),
    },
    {
      key: 'role_definition',
      label: 'تعريف الدور',
      type: 'select' as const,
      options: [{ value: '', label: 'لا شيء' }, ...roleDefinitions.map((r) => ({ value: r.id, label: r.name }))],
    },
    { key: 'is_primary', label: 'التخصيص الرئيسي', type: 'checkbox' as const },
    { key: 'is_active', label: 'نشط', type: 'checkbox' as const },
    { key: 'start_date', label: 'تاريخ البدء', type: 'date' as const },
    { key: 'end_date', label: 'تاريخ الانتهاء', type: 'date' as const },
  ];

  return (
    <div>
      <PageHeader title="التخصيصات" subtitle="إدارة تخصيص المستخدمين للمناصب" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/organization" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى الهيكل التنظيمي
        </Link>
        <button
          onClick={() => {
            setEditingAssignment(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء تخصيص
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
        data={assignments}
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
        key={`${editingAssignment?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAssignment(null);
          setFormErrors({});
        }}
        title={editingAssignment ? 'تعديل التخصيص' : 'إنشاء تخصيص'}
        fields={formFields}
        initialData={editingAssignment ? {
          user: editingAssignment.user,
          organizational_unit: editingAssignment.unit,
          position: editingAssignment.position,
          role_definition: editingAssignment.role || '',
          is_primary: editingAssignment.is_primary,
          is_active: editingAssignment.is_active,
          start_date: editingAssignment.start_date || '',
          end_date: editingAssignment.end_date || '',
        } : { is_primary: false, is_active: true }}
        onSubmit={editingAssignment ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
