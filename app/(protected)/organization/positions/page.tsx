'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Position, PositionType, Unit } from '@/types';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import Link from 'next/link';

export default function PositionsPage() {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});

  const institutionId = user?.institution_id || '';

  const loadPositions = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [positionsResponse, typesResponse, unitsResponse] = await Promise.all([
        organizationService.getPositions({
          institution: institutionId,
          organizationalUnit: filters.organizationalUnit as string | undefined,
          positionType: filters.positionType as string | undefined,
          isActive: filters.isActive as boolean | undefined,
        }),
        organizationService.getPositionTypes({ institution: institutionId }),
        organizationService.getUnits({ institution: institutionId }),
      ]);
      setPositions(positionsResponse.results);
      setPositionTypes(typesResponse.results);
      setUnits(unitsResponse.results);
    } catch {
      setError('فشل تحميل المناصب');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.organizationalUnit, filters.positionType, filters.isActive]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.createPosition({
        institution: institutionId,
        title: data.title as string,
        code: data.code as string,
        position_type: data.position_type as string,
        organizational_unit: data.organizational_unit as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadPositions();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء المنصب' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingPosition) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.updatePosition(editingPosition.id, {
        title: data.title as string,
        code: data.code as string,
        position_type: data.position_type as string,
        organizational_unit: data.organizational_unit as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingPosition(null);
      loadPositions();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث المنصب' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setIsModalOpen(true);
  };

  const columns: Column<Position>[] = [
    { key: 'title', header: 'العنوان' },
    { key: 'code', header: 'الرمز', render: (item) => item.code || '-' },
    { key: 'position_type_name', header: 'نوع المنصب' },
    { key: 'unit_name', header: 'الوحدة' },
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
      key: 'positionType',
      label: 'نوع المنصب',
      type: 'select' as const,
      options: positionTypes.map((t) => ({ value: t.id, label: t.name })),
    },
    { key: 'isActive', label: 'نشط فقط', type: 'checkbox' as const },
  ];

  const formFields = [
    { key: 'title', label: 'العنوان', type: 'text' as const, required: true },
    { key: 'code', label: 'الرمز', type: 'text' as const },
    {
      key: 'position_type',
      label: 'نوع المنصب',
      type: 'select' as const,
      required: true,
      options: positionTypes.map((t) => ({ value: t.id, label: t.name })),
    },
    {
      key: 'organizational_unit',
      label: 'الوحدة التنظيمية',
      type: 'select' as const,
      required: true,
      options: units.map((u) => ({ value: u.id, label: u.name })),
    },
    { key: 'description', label: 'الوصف', type: 'textarea' as const },
    { key: 'is_active', label: 'نشط', type: 'checkbox' as const },
  ];

  return (
    <div>
      <PageHeader title="المناصب" subtitle="إدارة المناصب داخل الوحدات التنظيمية" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/organization" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى الهيكل التنظيمي
        </Link>
        <button
          onClick={() => {
            setEditingPosition(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء منصب
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
        data={positions}
        keyExtractor={(item) => item.id}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <EntityFormModal
        key={`${editingPosition?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPosition(null);
          setFormErrors({});
        }}
        title={editingPosition ? 'تعديل المنصب' : 'إنشاء منصب'}
        fields={formFields}
        initialData={editingPosition ? {
          title: editingPosition.title,
          code: editingPosition.code || '',
          position_type: editingPosition.position_type,
          organizational_unit: editingPosition.unit,
          is_active: editingPosition.is_active,
        } : { is_active: true }}
        onSubmit={editingPosition ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
