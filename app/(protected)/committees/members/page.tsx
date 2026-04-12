'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CommitteeMember, Committee, Assignment } from '@/types';
import { committeesService } from '@/services/committees';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { FilterBar } from '@/components/management/FilterBar';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';

const memberRoleOptions = [
  { value: 'chair', label: 'Chair' },
  { value: 'vice_chair', label: 'Vice Chair' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'member', label: 'Member' },
];

export default function CommitteeMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const institutionId = user?.institution_id || '';

  const loadMembers = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const membersResponse = await committeesService.getCommitteeMembers({
        committee: filters.committee as string | undefined,
        isActive: filters.isActive as boolean | undefined,
        page: currentPage,
      });
      setMembers(membersResponse.results);
      setTotalItems(membersResponse.count);
      setHasNextPage(Boolean(membersResponse.next));
      setHasPreviousPage(Boolean(membersResponse.previous));
    } catch {
      setError('فشل تحميل أعضاء اللجان');
    } finally {
      setIsLoading(false);
    }
  }, [institutionId, filters.committee, filters.isActive, currentPage]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const loadAllCommittees = useCallback(async () => {
    if (!institutionId) { setCommittees([]); return; }
    try {
      const all: Committee[] = [];
      let page = 1;
      while (true) {
        const response = await committeesService.getCommittees({ institution: institutionId, page });
        all.push(...response.results);
        if (!response.next) break;
        page++;
      }
      setCommittees(all);
    } catch {
      setCommittees([]);
    }
  }, [institutionId]);

  const loadAllAssignments = useCallback(async () => {
    if (!institutionId) { setAssignments([]); return; }
    try {
      const all: Assignment[] = [];
      let page = 1;
      while (true) {
        const response = await organizationService.getAssignments({ institution: institutionId, page });
        all.push(...response.results);
        if (!response.next) break;
        page++;
      }
      setAssignments(all);
    } catch {
      setAssignments([]);
    }
  }, [institutionId]);

  useEffect(() => {
    loadAllCommittees();
  }, [loadAllCommittees]);

  useEffect(() => {
    loadAllAssignments();
  }, [loadAllAssignments]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await committeesService.createCommitteeMember({
        institution: institutionId,
        committee: data.committee as string,
        assignment: data.assignment as string,
        role: data.role as 'chair' | 'vice_chair' | 'secretary' | 'member',
        joined_at: data.joined_at as string | undefined,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadMembers();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل إضافة العضو' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingMember) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await committeesService.updateCommitteeMember(editingMember.id, {
        role: data.role as 'chair' | 'vice_chair' | 'secretary' | 'member',
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      setEditingMember(null);
      loadMembers();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, string[]> };
      if (apiError.status === 400 && apiError.data) {
        const errors: Record<string, string> = {};
        Object.entries(apiError.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        setFormErrors({ general: 'فشل تحديث العضو' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: CommitteeMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const columns: Column<CommitteeMember>[] = [
    { 
      key: 'committee_name', 
      header: 'اللجنة',
      render: (item) => (
        <Link href={`/committees/${item.committee}`} className="text-blue-600 hover:text-blue-800">
          {item.committee_name}
        </Link>
      ),
    },
    { key: 'member_name', header: 'الاسم' },
    { key: 'member_email', header: 'البريد الإلكتروني' },
    { key: 'role', header: 'الدور' },
    { key: 'joined_at', header: 'تاريخ الانضمام', render: (item) => new Date(item.joined_at).toLocaleDateString('ar-SA') },
    { key: 'is_active', header: 'نشط', render: (item) => (item.is_active ? 'نعم' : 'لا') },
  ];

  const filterFields = [
    {
      key: 'committee',
      label: 'اللجنة',
      type: 'select' as const,
      options: committees.map((c) => ({ value: c.id, label: c.name })),
    },
    { key: 'isActive', label: 'نشط فقط', type: 'checkbox' as const },
  ];

  const formFields = [
    {
      key: 'committee',
      label: 'اللجنة',
      type: 'select' as const,
      required: true,
      options: committees.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      key: 'assignment',
      label: 'التخصيص',
      type: 'select' as const,
      required: true,
      options: assignments.map((a) => ({ 
        value: a.id, 
        label: `${a.user_full_name} - ${a.position_title}` 
      })),
    },
    {
      key: 'role',
      label: 'الدور',
      type: 'select' as const,
      required: true,
      options: memberRoleOptions,
    },
    { key: 'joined_at', label: 'تاريخ الانضمام', type: 'date' as const },
    { key: 'is_active', label: 'نشط', type: 'checkbox' as const },
  ];

  const editFormFields = [
    {
      key: 'role',
      label: 'الدور',
      type: 'select' as const,
      required: true,
      options: memberRoleOptions,
    },
    { key: 'is_active', label: 'نشط', type: 'checkbox' as const },
  ];

  return (
    <div>
      <PageHeader title="أعضاء اللجان" subtitle="إدارة عضويات اللجان" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/committees" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى اللجان
        </Link>
        <button
          onClick={() => {
            setEditingMember(null);
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          إضافة عضو
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
        data={members}
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
        key={`${editingMember?.id ?? 'new'}-${isModalOpen ? 'open' : 'closed'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
          setFormErrors({});
        }}
        title={editingMember ? 'تعديل العضو' : 'إضافة عضو'}
        fields={editingMember ? editFormFields : formFields}
        initialData={editingMember ? {
          role: editingMember.role,
          is_active: editingMember.is_active,
        } : { is_active: true }}
        onSubmit={editingMember ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
