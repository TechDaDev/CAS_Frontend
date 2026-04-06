'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Committee, CommitteeMember, Assignment } from '@/types';
import { committeesService } from '@/services/committees';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { EntityTable, Column } from '@/components/management/EntityTable';
import { EntityFormModal } from '@/components/management/EntityFormModal';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import Link from 'next/link';

const memberRoleOptions = [
  { value: 'chair', label: 'رئيس' },
  { value: 'vice_chair', label: 'نائب الرئيس' },
  { value: 'secretary', label: 'أمين السر' },
  { value: 'member', label: 'عضو' },
];

export default function CommitteeDetailPage() {
  const params = useParams();
  const committeeId = params.id as string;

  const [committee, setCommittee] = useState<Committee | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadCommittee = useCallback(async () => {
    if (!committeeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [committeeData, membersData, assignmentsData] = await Promise.all([
        committeesService.getCommittee(committeeId),
        committeesService.getCommitteeMembersByCommitteeId(committeeId),
        organizationService.getAssignments({}),
      ]);
      setCommittee(committeeData);
      setMembers(membersData.results);
      setAssignments(assignmentsData.results);
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 404) {
        setError('اللجنة غير موجودة');
      } else if (apiError.status === 403) {
        setError('ليس لديك صلاحية لعرض هذه اللجنة');
      } else {
        setError('فشل تحميل تفاصيل اللجنة');
      }
    } finally {
      setIsLoading(false);
    }
  }, [committeeId]);

  useEffect(() => {
    loadCommittee();
  }, [loadCommittee]);

  const handleCreateMember = async (data: Record<string, unknown>) => {
    if (!committee) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await committeesService.createCommitteeMember({
        institution: committee.institution,
        committee: committeeId,
        assignment: data.assignment as string,
        role: data.role as 'chair' | 'vice_chair' | 'secretary' | 'member',
        joined_at: data.joined_at as string | undefined,
        is_active: data.is_active as boolean,
      });
      setIsModalOpen(false);
      loadCommittee();
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

  const handleUpdateMember = async (data: Record<string, unknown>) => {
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
      loadCommittee();
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

  const handleEditMember = (member: CommitteeMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const memberColumns: Column<CommitteeMember>[] = [
    { key: 'member_name', header: 'الاسم' },
    { key: 'member_email', header: 'البريد الإلكتروني' },
    { key: 'role', header: 'الدور' },
    { key: 'joined_at', header: 'تاريخ الانضمام', render: (item) => new Date(item.joined_at).toLocaleDateString('ar-SA') },
    { key: 'is_active', header: 'نشط', render: (item) => (item.is_active ? 'نعم' : 'لا') },
  ];

  const formFields = [
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

  if (isLoading) {
    return <LoadingState message="جارٍ تحميل تفاصيل اللجنة..." />;
  }

  if (error || !committee) {
    return <ErrorState title="خطأ" message={error || 'اللجنة غير موجودة'} />;
  }

  return (
    <div>
      <PageHeader title={committee.name} subtitle={`${committee.committee_type_name} Committee`} />

      <div className="mb-6">
        <Link href="/committees/list" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى اللجان
        </Link>
      </div>

      {/* Committee Info Card */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">معلومات اللجنة</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500">الرمز</dt>
            <dd className="text-sm font-medium text-slate-900">{committee.code}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">النوع</dt>
            <dd className="text-sm font-medium text-slate-900">{committee.committee_type_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">نطاق الوحدة</dt>
            <dd className="text-sm font-medium text-slate-900">{committee.scope_unit_name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">الحالة</dt>
            <dd className="text-sm font-medium text-slate-900">{committee.status}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">دائمة</dt>
            <dd className="text-sm font-medium text-slate-900">{committee.is_permanent ? 'نعم' : 'لا'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">نشطة</dt>
            <dd className="text-sm font-medium text-slate-900">{committee.is_active ? 'نعم' : 'لا'}</dd>
          </div>
          {committee.start_date && (
            <div>
              <dt className="text-sm text-slate-500">تاريخ البدء</dt>
              <dd className="text-sm font-medium text-slate-900">{new Date(committee.start_date).toLocaleDateString('ar-SA')}</dd>
            </div>
          )}
          {committee.end_date && (
            <div>
              <dt className="text-sm text-slate-500">تاريخ الانتهاء</dt>
              <dd className="text-sm font-medium text-slate-900">{new Date(committee.end_date).toLocaleDateString('ar-SA')}</dd>
            </div>
          )}
          {committee.description && (
            <div className="md:col-span-2">
              <dt className="text-sm text-slate-500">الوصف</dt>
              <dd className="text-sm font-medium text-slate-900">{committee.description}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Members Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">أعضاء اللجنة</h2>
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

        <EntityTable
          columns={memberColumns}
          data={members}
          keyExtractor={(item) => item.id}
          onEdit={handleEditMember}
          isLoading={isLoading}
        />
      </div>

      <EntityFormModal
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
        onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  );
}
