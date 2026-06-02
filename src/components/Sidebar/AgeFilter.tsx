'use client'

import { AGE_OPTIONS } from '@/lib/filterLessons'

type Props = {
  selected: string | null
  onChange: (age: string | null) => void
}

export default function AgeFilter({ selected, onChange }: Props) {
  return (
    <div>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
        対象年齢
      </span>
      <select
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
      >
        <option value="">すべての年齢</option>
        {AGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
