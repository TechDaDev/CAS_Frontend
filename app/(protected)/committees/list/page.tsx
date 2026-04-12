'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Committee, CommitteeType, Unit } from '@/types';
import { committeesService } from '@/services/committees';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';

export default function CommitteesListPage() {
  const { user } = useAuth();
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [committeeTypes, setCommitteeTypes] = useState<CommitteeType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const institutionId = user?.institution_id || '';

  const loadCommittees = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const committeesResponse = await committeesService.getCommittees({
        institution: institutionId,
        committeeType: filters.committeeType as string | undefined,
        scopeUnit: filters.scopeUnit as string | undefined,
        status: filters.status as string | undefined,
        isActive: filters.isActive as boolean | undefined,
        page: currentPage,
      });
      setCommittees(committeesResponse.results);
      setTotalItems(committeesResponse.count);
      setHasNextPage(Boolean(committeesResponse.next));
      setHasPreviousPage(Boolean(committeesResponse.previous));
    } catch {
      setError('فشل تحميل اللجان');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.committeeType, filters.scopeUnit, filters.status, filters.isActive, currentPage]);

  useEffect(() => {
    loadCommittees();
  }, [loadCommittees]);

  const loadAllCommitteeTypes = useCallback(async () => {
    if (!institutionId) { setCommitteeTypes([]); return; }
    try {
      const all: CommitteeType[] = [];
      let page = 1;
      while (true) {
        const response = await committeesService.getCommitteeTypes({ institution: institutionId, page });
        all.push(...response.results);
        if (!response.next) break;
        page++;
      }
      setCommitteeTypes(all);
    } catch {
      setCommitteeTypes([]);
    }
  }, [institutionId]);

  const loadAllUnitsForDropdown = useCallback(async () => {
    if (!institutionId) { setUnits([]); return; }
    try {
      const all: Unit[] = [];
      let page = 1;
      while (true) {
        const response = await organizationService.getUnits({ institution: institutionId, page });
        all.push(...response.results);
        if (!response.next) break;
        page++;
      }
      setUnits(all);
    } catch {
      setUnits([]);
    }
  }, [institutionId]);

  useEffect(() => {
    loadAllCommitteeTypes();
  }, [loadAllCommitteeTypes]);

  useEffect(() => {
    loadAllUnitsForDropdown();
  }, [loadAllUnitsForDropdown]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await committeesService.createCommittee({
        institution: institutionId,
        name: data.name as string,
        code: data.code as string,
        committee_type: data.committee_type as string,
        description: data.description as string,
        scope_unit: data.scope_unit as string | undefined,
        is_permanent: data.is_permanent as boolean,
        start_date: data.start_date as string | undefined,
        end_date: data.end_date as string | undefined,
        status: (data.status as 'active' | 'inactive' | 'dissolved') || 'active',
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadCommittees();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء اللجنة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingCommittee) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await committeesService.updateCommittee(editingCommittee.id, {
        name: data.name as string,
        code: data.code as string,
        committee_type: data.committee_type as string,
        description: data.description as string,
        scope_unit: data.scope_unit as string | undefined,
        is_permanent: data.is_permanent as boolean,
        start_date: data.start_date as string | undefined,
        end_date: data.end_date as string | undefined,
        status: data.status as 'active' | 'inactive' | 'dissolved',
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingCommittee(null);
      loadCommittees();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث اللجنة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (committee: Committee) => {
    setEditingCommittee(committee);
    setIsModalOpen(true);
  };

  const columns: Column<Committee>[] = [
    { 
      key: 'name', 
      header: 'الاسم',
      render: (item) => (
        <Link href={`/committees/${item.id}`} className="text-blue-600 hover:text-blue-800">
          {item.name}
        </Link>
      ),
    },
    { key: 'code', header: 'الرمز' },
    { key: 'committee_type_name', header: 'النوع' },
    { key: 'scope_unit_name', header: 'نطاق الوحدة', render: (item) => item.scope_unit_name || '-' },
    { key: 'is_permanent', header: 'دائمة', render: (item) => (item.is_permanent ? 'نعم' : 'لا') },
    { key: 'status', header: 'الحالة' },
    { key: 'is_active', header: 'نشط', render: (item) => (item.is_active ? 'نعم' : 'لا') },
  ];

  const filterFields = [
    {
      key: 'committeeType',
      label: 'نوع اللجنة',
      type: 'select' as const,
      options: committeeTypes.map((t) => ({ value: t.id, label: t.name })),
    },
    {
      key: 'scopeUnit',
      label: 'نطاق الوحدة',
      type: 'select' as const,
      options: units.map((u) => ({ value: u.id, label: u.name })),
    },
    {
      key: 'status',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'dissolved', label: 'منحل' },
      ],
    },
    { key: 'isActive', label: 'نشط فقط', type: 'checkbox' as const },
  ];

  const formFields = [
    { key: 'name', label: 'الاسم', type: 'text' as const, required: true },
    { key: 'code', label: 'الرمز', type: 'text' as const, required: true },
    {
      key: 'committee_type',
      label: 'نوع اللجنة',
      type: 'select' as const,
      required: true,
      options: committeeTypes.map((t) => ({ value: t.id, label: t.name })),
    },
    { key: 'description', label: 'الوصف', type: 'textarea' as const },
    {
      key: 'scope_unit',
      label: 'نطاق الوحدة',
      type: 'select' as const,
      options: [{ value: '', label: 'لا شيء' }, ...units.map((u) => ({ value: u.id, label: u.name }))],
    },
    { key: 'is_permanent', label: 'دائمة', type: 'checkbox' as const },
    { key: 'start_date', label: 'تاريخ البدء', type: 'date' as const },
    { key: 'end_date', label: 'تاريخ الانتهاء', type: 'date' as const },
    {
      key: 'status',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'dissolved', label: 'منحل' },
      ],
    },
    { key: 'is_active', label: 'نشط', type: 'checkbox' as const },
  ];

  return (
    <div>
      <PageHeader title="اللجان" subtitle="إدارة اللجان" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/committees" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى اللجان
        </Link>
        <button
          onClick={() => {
            setEditingCommittee(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء لجنة
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
        data={committees}
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
        key={`${editingCommittee?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCommittee(null);
          setFormErrors({});
        }}
        title={editingCommittee ? 'تعديل اللجنة' : 'إنشاء لجنة'}
        fields={formFields}
        initialData={editingCommittee ? {
          name: editingCommittee.name,
          code: editingCommittee.code,
          committee_type: editingCommittee.committee_type,
          description: editingCommittee.description || '',
          scope_unit: editingCommittee.scope_unit || '',
          is_permanent: editingCommittee.is_permanent,
          start_date: editingCommittee.start_date || '',
          end_date: editingCommittee.end_date || '',
          status: editingCommittee.status,
          is_active: editingCommittee.is_active,
        } : { status: 'active', is_active: true, is_permanent: false }}
        onSubmit={editingCommittee ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
