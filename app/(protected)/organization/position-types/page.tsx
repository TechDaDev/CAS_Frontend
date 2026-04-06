'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PositionType } from '@/types';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import Link from 'next/link';

export default function PositionTypesPage() {
  const { user } = useAuth();
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPositionType, setEditingPositionType] = useState<PositionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});

  const institutionId = user?.institution_id || '';

  const loadPositionTypes = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await organizationService.getPositionTypes({
        institution: institutionId,
        isActive: filters.isActive as boolean | undefined,
      });
      setPositionTypes(response.results);
    } catch (err) {
      setError('فشل تحميل أنواع المناصب');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.isActive]);

  useEffect(() => {
    loadPositionTypes();
  }, [loadPositionTypes]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.createPositionType({
        institution: institutionId,
        name: data.name as string,
        code: data.code as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadPositionTypes();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء نوع المنصب' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingPositionType) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await organizationService.updatePositionType(editingPositionType.id, {
        name: data.name as string,
        code: data.code as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingPositionType(null);
      loadPositionTypes();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث نوع المنصب' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (positionType: PositionType) => {
    setEditingPositionType(positionType);
    setIsModalOpen(true);
  };

  const columns: Column<PositionType>[] = [
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
      <PageHeader title="أنواع المناصب" subtitle="إدارة تصنيفات أنواع المناصب" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/organization" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى الهيكل التنظيمي
        </Link>
        <button
          onClick={() => {
            setEditingPositionType(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء نوع منصب
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
        data={positionTypes}
        keyExtractor={(item) => item.id}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <EntityFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPositionType(null);
          setFormErrors({});
        }}
        title={editingPositionType ? 'تعديل نوع المنصب' : 'إنشاء نوع منصب'}
        fields={formFields}
        initialData={editingPositionType ? {
          name: editingPositionType.name,
          code: editingPositionType.code,
          description: editingPositionType.description || '',
          is_active: editingPositionType.is_active,
        } : { is_active: true }}
        onSubmit={editingPositionType ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
