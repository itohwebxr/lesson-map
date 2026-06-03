'use client'

import { useState } from 'react'

type Props = {
  timeStart: string | null
  timeEnd: string | null
  onChange: (start: string | null, end: string | null) => void
}

export default function TimeFilter({ timeStart, timeEnd, onChange }: Props) {
  const [open, setOpen] = useState(true)

  const start = timeStart ?? '09:00'
  const end = timeEnd ?? '21:00'

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5"
      >
        時間帯
        {(timeStart || timeEnd) && (
          <span className="font-normal text-blue-600 ml-1">{start}〜{end}</span>
        )}
        <span className="text-gray-400 text-sm leading-none">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-10 shrink-0">開始</label>
            <input
              type="time"
              value={start}
              min="06:00"
              max="22:00"
              onChange={(e) => onChange(e.target.value || null, timeEnd)}
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-10 shrink-0">終了</label>
            <input
              type="time"
              value={end}
              min="06:00"
              max="23:00"
              onChange={(e) => onChange(timeStart, e.target.value || null)}
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
            />
          </div>
          {(timeStart || timeEnd) && (
            <button
              onClick={() => onChange(null, null)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              時間をリセット
            </button>
          )}
        </div>
      )}
    </div>
  )
}
