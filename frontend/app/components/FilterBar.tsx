'use client';

import { TAGS } from '../lib/tags';

export interface FilterBarValues {
  tag: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_FILTER_VALUES: FilterBarValues = {
  tag: '',
  userId: '',
  dateFrom: '',
  dateTo: '',
};

interface FilterBarProps {
  values: FilterBarValues;
  onChange: (values: FilterBarValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FilterBar({
  values,
  onChange,
  onApply,
  onReset,
}: FilterBarProps) {
  function updateField<K extends keyof FilterBarValues>(
    field: K,
    value: FilterBarValues[K],
  ): void {
    onChange({ ...values, [field]: value });
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">Filters</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="filter-tag"
            className="block text-xs font-medium text-zinc-600"
          >
            Tag
          </label>
          <select
            id="filter-tag"
            value={values.tag}
            onChange={(event) => updateField('tag', event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
          >
            <option value="">All tags</option>
            {TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-user"
            className="block text-xs font-medium text-zinc-600"
          >
            Author ID
          </label>
          <input
            id="filter-user"
            type="text"
            placeholder="UUID"
            value={values.userId}
            onChange={(event) => updateField('userId', event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="filter-from"
            className="block text-xs font-medium text-zinc-600"
          >
            From date
          </label>
          <input
            id="filter-from"
            type="date"
            value={values.dateFrom}
            onChange={(event) => updateField('dateFrom', event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="filter-to"
            className="block text-xs font-medium text-zinc-600"
          >
            To date
          </label>
          <input
            id="filter-to"
            type="date"
            value={values.dateTo}
            onChange={(event) => updateField('dateTo', event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onApply}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
