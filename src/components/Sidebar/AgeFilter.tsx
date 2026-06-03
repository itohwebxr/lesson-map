'use client'

import { useState } from 'react'
import { AGE_OPTIONS } from '@/lib/filterLessons'
import { trackEvent, GA_EVENTS } from '@/lib/gtm'

type Props = {
  selected: string | null
  onChange: (age: string | null) => void
}

export default function AgeFilter({ selected, onChange }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wide"
      >
        対象年齢
        <span className="text-gray-400 text-sm leading-none">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <select
          value={selected ?? ''}
          onChange={(e) => {
            const val = e.target.value || null
            onChange(val)
            if (val) trackEvent(GA_EVENTS.AGE_FILTER, { age_group: val })
          }}
          className="mt-2 w-full text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
        >
          <option value="">すべての年齢</option>
          {AGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
