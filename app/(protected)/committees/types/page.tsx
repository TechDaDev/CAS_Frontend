'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CommitteeType } from '@/types';
import { committeesService } from '@/services/committees';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import Link from 'next/link';

export default function CommitteeTypesPage() {
  const { user } = useAuth();
  const [committeeTypes, setCommitteeTypes] = useState<CommitteeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<CommitteeType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});

  const institutionId = user?.institution_id || '';

  const loadCommitteeTypes = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await committeesService.getCommitteeTypes({
        institution: institutionId,
        isActive: filters.isActive as boolean | undefined,
      });
      setCommitteeTypes(response.results);
    } catch {
      setError('فشل تحميل أنواع اللجان');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.isActive]);

  useEffect(() => {
    loadCommitteeTypes();
  }, [loadCommitteeTypes]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await committeesService.createCommitteeType({
        institution: institutionId,
        name: data.name as string,
        code: data.code as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadCommitteeTypes();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إنشاء نوع اللجنة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingType) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await committeesService.updateCommitteeType(editingType.id, {
        name: data.name as string,
        code: data.code as string,
        description: data.description as string,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingType(null);
      loadCommitteeTypes();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث نوع اللجنة' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (type: CommitteeType) => {
    setEditingType(type);
    setIsModalOpen(true);
  };

  const columns: Column<CommitteeType>[] = [
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
      <PageHeader title="أنواع اللجان" subtitle="إدارة تصنيفات أنواع اللجان" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/committees" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى اللجان
        </Link>
        <button
          onClick={() => {
            setEditingType(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إنشاء نوع لجنة
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
        data={committeeTypes}
        keyExtractor={(item) => item.id}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <EntityFormModal
        key={`${editingType?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingType(null);
          setFormErrors({});
        }}
        title={editingType ? 'تعديل نوع اللجنة' : 'إنشاء نوع لجنة'}
        fields={formFields}
        initialData={editingType ? {
          name: editingType.name,
          code: editingType.code,
          description: editingType.description || '',
          is_active: editingType.is_active,
        } : { is_active: true }}
        onSubmit={editingType ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
