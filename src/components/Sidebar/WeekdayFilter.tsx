'use client'

import { useState } from 'react'
import { trackEvent, GA_EVENTS } from '@/lib/gtm'

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

const WEEKDAY_EN: Record<string, string> = {
  月: 'monday', 火: 'tuesday', 水: 'wednesday', 木: 'thursday',
  金: 'friday', 土: 'saturday', 日: 'sunday',
}

type Props = {
  selected: string[]
  onChange: (v: string[]) => void
}

export default function WeekdayFilter({ selected, onChange }: Props) {
  const [open, setOpen] = useState(true)

  const toggle = (day: string) => {
    const adding = !selected.includes(day)
    onChange(adding ? [...selected, day] : selected.filter((d) => d !== day))
    if (adding) trackEvent(GA_EVENTS.DAY_FILTER, { day: WEEKDAY_EN[day] ?? day })
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-600"
      >
        曜日
        <span className="text-gray-400 text-sm leading-none">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {WEEKDAYS.map((day) => {
            const active = selected.includes(day)
            return (
              <button
                key={day}
                onClick={() => toggle(day)}
                className={`w-8 h-8 text-xs rounded border transition-colors ${
                  active
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
