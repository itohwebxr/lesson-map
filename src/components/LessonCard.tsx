'use client'

import type { Lesson } from '@/types/lesson'

const CATEGORY_ICONS: Record<string, string> = {
  'サッカー': '⚽', 'スイミング': '🏊', 'ダンス': '💃', '体操': '🤸',
  '英会話': '🌏', '学習塾': '📚', 'ピアノ': '🎹', 'プログラミング': '💻',
}

type Props = {
  lesson: Lesson
  isActive?: boolean
  onClick?: () => void
}

export default function LessonCard({ lesson, isActive, onClick }: Props) {
  const hasLocation = lesson.lat !== undefined && lesson.lng !== undefined
  const hasSchedule = lesson.schedules?.some((s) => s.weekday)

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isActive
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-medium text-gray-800 leading-snug">
          {lesson.name}
        </span>
        <span className="shrink-0 text-base" title={lesson.category}>
          {CATEGORY_ICONS[lesson.category] ?? '📍'}
        </span>
      </div>

      {lesson.address ? (
        <p className="text-xs text-gray-500 mb-1 truncate">📍 {lesson.address}</p>
      ) : (
        <p className="text-xs text-gray-400 mb-1">📍 住所未取得</p>
      )}

      {lesson.target_age && (
        <p className="text-xs text-gray-500 mb-1">👶 {lesson.target_age}</p>
      )}

      {hasSchedule && (
        <p className="text-xs text-gray-500">
          🗓{' '}
          {lesson.schedules
            .filter((s) => s.weekday)
            .map((s) =>
              s.start_time ? `${s.weekday} ${s.start_time}〜` : s.weekday
            )
            .slice(0, 2)
            .join('  ')}
        </p>
      )}

      {!hasLocation && (
        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
          地図表示なし
        </span>
      )}
    </div>
  )
}
