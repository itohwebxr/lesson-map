'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/filterLessons'
import { trackEvent, GA_EVENTS } from '@/lib/gtm'

const CATEGORY_ICONS: Record<string, string> = {
  'サッカー': '⚽',
  'スイミング': '🏊',
  'ダンス': '💃',
  'バレエ': '🩰',
  '体操': '🤸',
  '新体操': '🎀',
  'チアダンス': '📣',
  '英会話': '🌏',
  '学習塾': '📚',
  'ピアノ': '🎹',
  'プログラミング': '💻',
  '武道': '🥋',
  'テニス': '🎾',
  'バスケ': '🏀',
  '野球': '⚾',
  '習字': '🖌️',
  'そろばん': '🧮',
  '幼児教室': '🧸',
}

const INITIAL_COUNT = 8

type Props = {
  selected: string[]
  onChange: (categories: string[]) => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState(true)

  function toggle(cat: string) {
    const next = selected.includes(cat)
      ? selected.filter((c) => c !== cat)
      : [...selected, cat]
    onChange(next)
    if (!selected.includes(cat)) {
      trackEvent(GA_EVENTS.CATEGORY_FILTER, { category: cat })
    }
  }

  const visible = expanded ? CATEGORIES : CATEGORIES.slice(0, INITIAL_COUNT)
  const hiddenCount = CATEGORIES.length - INITIAL_COUNT

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wide"
      >
        カテゴリ
        <span className="text-gray-400 text-sm leading-none">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {visible.map((cat) => {
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
                  <span>{CATEGORY_ICONS[cat] ?? '📍'}</span>
                  <span>{cat}</span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 w-full text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1"
          >
            {expanded ? <>▲ 閉じる</> : <>▼ さらに{hiddenCount}件を表示</>}
          </button>
        </>
      )}
    </div>
  )
}

