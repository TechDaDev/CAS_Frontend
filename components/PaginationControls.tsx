interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  currentPage,
  totalItems,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  isLoading,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">إجمالي العناصر: {totalItems}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage || isLoading}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          السابق
        </button>
        <span className="min-w-[88px] text-center text-sm font-medium text-slate-700">الصفحة {currentPage}</span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </div>
  );
}