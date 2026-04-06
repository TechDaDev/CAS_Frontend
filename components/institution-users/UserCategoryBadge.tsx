import { UserCategory } from '@/types';

interface UserCategoryBadgeProps {
  category: UserCategory;
}

const categoryLabels: Record<UserCategory, string> = {
  teaching: 'تدريسي',
  staff: 'موظف',
};

const categoryStyles: Record<UserCategory, string> = {
  teaching: 'bg-blue-50 text-blue-700',
  staff: 'bg-emerald-50 text-emerald-700',
};

export function UserCategoryBadge({ category }: UserCategoryBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${categoryStyles[category]}`}>
      {categoryLabels[category]}
    </span>
  );
}
