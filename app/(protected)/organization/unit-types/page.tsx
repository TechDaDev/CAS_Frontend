'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UnitType } from '@/types';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import Link from 'next/link';

export default function UnitTypesPage() {
  const { user } = useAuth();
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState<UnitType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});

  const institutionId = user?.institution_id || '';

  const loadUnitTypes = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await organizationService.getUnitTypes({
        institution: institutionId,
        isActive: filters.isActive as boolean | undefined,
      });
      setUnitTypes(response.results);
    } catch {
      setError('Failed to load unit types');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.isActive]);

  useEffect(() => {
    loadUnitTypes();
  }, [loadUnitTypes]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.createUnitType({
        institution: institutionId,
        name: data.name as string,
        code: data.code as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadUnitTypes();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء نوع الوحدة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingUnitType) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.updateUnitType(editingUnitType.id, {
        name: data.name as string,
        code: data.code as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingUnitType(null);
      loadUnitTypes();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث نوع الوحدة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (unitType: UnitType) => {
    setEditingUnitType(unitType);
    setIsModalOpen(true);
  };

  const columns: Column<UnitType>[] = [
    { key: 'name', header: 'الاسم' },
    { key: 'code', header: 'الرمز' },
    { key: 'description', header: 'الوصف', render: (item) => item.description || '-' },
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
      <PageHeader title="أنواع الوحدات" subtitle="إدارة تصنيفات أنواع الوحدات" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/organization" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى الهيكل التنظيمي
        </Link>
        <button
          onClick={() => {
            setEditingUnitType(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء نوع وحدة
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
        data={unitTypes}
        keyExtractor={(item) => item.id}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <EntityFormModal
        key={`${editingUnitType?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnitType(null);
          setFormErrors({});
        }}
        title={editingUnitType ? 'تعديل نوع الوحدة' : 'إنشاء نوع وحدة'}
        fields={formFields}
        initialData={editingUnitType ? {
          name: editingUnitType.name,
          code: editingUnitType.code,
          description: editingUnitType.description || '',
          is_active: editingUnitType.is_active,
        } : { is_active: true }}
        onSubmit={editingUnitType ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
