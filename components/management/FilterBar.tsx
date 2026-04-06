import { useState, FormEvent } from 'react';

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  options?: { value: string; label: string }[];
}

interface FilterBarProps {
  fields: FilterField[];
  onFilter: (filters: Record<string, string | boolean>) => void;
  initialFilters?: Record<string, string | boolean>;
}

export function FilterBar({ fields, onFilter, initialFilters = {} }: FilterBarProps) {
  const [filters, setFilters] = useState<Record<string, string | boolean>>(initialFilters);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({});
    onFilter({});
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-4">
        {fields.map((field) => (
          <div key={field.key} className="min-w-[150px]">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {field.label}
            </label>
            {field.type === 'text' && (
              <input
                type="text"
                value={(filters[field.key] as string) || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={`Filter by ${field.label.toLowerCase()}...`}
              />
            )}
            {field.type === 'select' && (
              <select
                value={(filters[field.key] as string) || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'checkbox' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(filters[field.key] as boolean) || false}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">{field.label}</span>
              </label>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
