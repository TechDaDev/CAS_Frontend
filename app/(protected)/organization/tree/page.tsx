'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UnitTreeNode } from '@/types';
import { organizationService } from '@/services/organization';
import { PageHeader } from '@/components/PageHeader';
import { OrganizationTree } from '@/components/organization/OrganizationTree';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';

export default function OrganizationTreePage() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<UnitTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<UnitTreeNode | null>(null);

  const institutionId = user?.institution_id || '';

  const loadTree = useCallback(async () => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationService.getUnitTree(institutionId);
      setTreeData(data);
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 403) {
        setError('ليس لديك صلاحية لعرض شجرة الهيكل التنظيمي.');
      } else {
        setError('فشل تحميل شجرة الهيكل التنظيمي');
      }
    } finally {
      setIsLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const handleSelect = (node: UnitTreeNode) => {
    setSelectedNode(node);
  };

  return (
    <div>
      <PageHeader title="شجرة الهيكل التنظيمي" subtitle="عرض الهيكل الهرمي للوحدات" />

      <div className="mb-4 flex items-center justify-between">
        <Link href="/organization" className="text-sm text-blue-600 hover:text-blue-800">
          ← العودة إلى الهيكل التنظيمي
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="جارٍ تحميل شجرة الهيكل..." />
      ) : error ? (
        <ErrorState title="خطأ" message={error} />
      ) : treeData.length === 0 ? (
        <EmptyState
          title="لا توجد وحدات"
          message="لا توجد وحدات تنظيمية لهذه المؤسسة بعد."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrganizationTree
              nodes={treeData}
              onSelect={handleSelect}
              selectedId={selectedNode?.id}
            />
          </div>
          <div>
            {selectedNode ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900 mb-4">تفاصيل الوحدة</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-slate-500">الاسم</dt>
                    <dd className="text-sm font-medium text-slate-900">{selectedNode.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">الرمز</dt>
                    <dd className="text-sm font-medium text-slate-900">{selectedNode.code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">نوع الوحدة</dt>
                    <dd className="text-sm font-medium text-slate-900">{selectedNode.unit_type_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">الحالة</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      {selectedNode.is_active ? (
                        <span className="text-emerald-600">نشط</span>
                      ) : (
                        <span className="text-slate-400">غير نشط</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">انقر على وحدة لعرض تفاصيلها</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
