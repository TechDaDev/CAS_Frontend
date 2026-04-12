'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Unit, UnitType } from '@/types';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';

export default function UnitsPage() {
  const { user } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const institutionId = user?.institution_id || '';

  const loadUnits = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [unitsResponse, typesResponse] = await Promise.all([
        organizationService.getUnits({
          institution: institutionId,
          unitType: filters.unitType as string | undefined,
          isActive: filters.isActive as boolean | undefined,
          page: currentPage,
        }),
        organizationService.getUnitTypes({ institution: institutionId }),
      ]);
      setUnits(unitsResponse.results);
      setUnitTypes(typesResponse.results);
      setTotalItems(unitsResponse.count);
      setHasNextPage(Boolean(unitsResponse.next));
      setHasPreviousPage(Boolean(unitsResponse.previous));
    } catch {
      setError('Failed to load units');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.unitType, filters.isActive, currentPage]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.createUnit({
        institution: institutionId,
        name: data.name as string,
        code: data.code as string,
        unit_type: data.unit_type as string,
        parent: data.parent as string | undefined,
        description: data.description as string,
        handles_incoming_outgoing: data.handles_incoming_outgoing as boolean,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadUnits();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء الوحدة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingUnit) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.updateUnit(editingUnit.id, {
        name: data.name as string,
        code: data.code as string,
        unit_type: data.unit_type as string,
        parent: data.parent as string | undefined,
        description: data.description as string,
        handles_incoming_outgoing: data.handles_incoming_outgoing as boolean,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingUnit(null);
      loadUnits();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث الوحدة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const columns: Column<Unit>[] = [
    { key: 'name', header: 'الاسم' },
    { key: 'code', header: 'الرمز' },
    { key: 'unit_type_name', header: 'نوع الوحدة' },
    { key: 'parent_name', header: 'الوحدة الأم', render: (item) => item.parent_name || '-' },
    { key: 'is_active', header: 'نشط', render: (item) => (item.is_active ? 'نعم' : 'لا') },
  ];

  const filterFields = [
    {
      key: 'unitType',
      label: 'نوع الوحدة',
      type: 'select' as const,
      options: unitTypes.map((t) => ({ value: t.id, label: t.name })),
    },
    { key: 'isActive', label: 'نشط فقط', type: 'checkbox' as const },
  ];

  const unitOptions = units.map((u) => ({ value: u.id, label: `${u.name} (${u.code})` }));
  const unitTypeOptions = unitTypes.map((t) => ({ value: t.id, label: t.name }));

  const formFields = [
    { key: 'name', label: 'الاسم', type: 'text' as const, required: true },
    { key: 'code', label: 'الرمز', type: 'text' as const, required: true },
    {
      key: 'unit_type',
      label: 'نوع الوحدة',
      type: 'select' as const,
      required: true,
      options: unitTypeOptions,
    },
    {
      key: 'parent',
      label: 'الوحدة الأم',
      type: 'select' as const,
      options: [{ value: '', label: 'لا شيء' }, ...unitOptions],
    },
    { key: 'description', label: 'الوصف', type: 'textarea' as const },
    { key: 'handles_incoming_outgoing', label: 'تعالج السجل الوارد والصادر', type: 'checkbox' as const },
    { key: 'is_active', label: 'نشط', type: 'checkbox' as const },
  ];

  return (
    <div>
      <PageHeader title="الوحدات" subtitle="إدارة الوحدات التنظيمية" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/organization" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى الهيكل التنظيمي
        </Link>
        <button
          onClick={() => {
            setEditingUnit(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء وحدة
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
        data={units}
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
        key={`${editingUnit?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
          setFormErrors({});
        }}
        title={editingUnit ? 'تعديل الوحدة' : 'إنشاء وحدة'}
        fields={formFields}
        initialData={editingUnit ? {
          name: editingUnit.name,
          code: editingUnit.code,
          unit_type: editingUnit.unit_type,
          parent: editingUnit.parent || '',
          description: editingUnit.description || '',
          handles_incoming_outgoing: editingUnit.handles_incoming_outgoing,
          is_active: editingUnit.is_active,
        } : { is_active: true, handles_incoming_outgoing: false }}
        onSubmit={editingUnit ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
