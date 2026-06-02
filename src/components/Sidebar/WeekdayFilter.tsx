'use client'

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

type Props = {
  selected: string[]
  onChange: (v: string[]) => void
}

export default function WeekdayFilter({ selected, onChange }: Props) {
  const toggle = (day: string) => {
    onChange(
      selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day]
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1.5">曜日</p>
      <div className="flex flex-wrap gap-1">
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
    </div>
  )
}
