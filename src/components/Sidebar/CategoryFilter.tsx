'use client'

import { CATEGORIES } from '@/lib/filterLessons'

const CATEGORY_ICONS: Record<string, string> = {
  'サッカー': '⚽', 'スイミング': '🏊', 'ダンス': '💃', '体操': '🤸',
  '英会話': '🌏', '学習塾': '📚', 'ピアノ': '🎹', 'プログラミング': '💻',
}

type Props = {
  selected: string[]
  onChange: (categories: string[]) => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  function toggle(cat: string) {
    onChange(
      selected.includes(cat)
        ? selected.filter((c) => c !== cat)
        : [...selected, cat]
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">カテゴリ</span>
        <div className="flex gap-2 text-xs text-blue-500">
          <button onClick={() => onChange(CATEGORIES)}>全選択</button>
          <span className="text-gray-300">|</span>
          <button onClick={() => onChange([])}>全解除</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {CATEGORIES.map((cat) => {
          const active = selected.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                active
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              <span>{cat}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
