'use client'

import { useState, useEffect, useRef } from 'react'
import type { Lesson } from '@/types/lesson'
import type { PlaceRating } from '@/app/api/place/[placeId]/route'

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span className="text-yellow-400 text-xs" aria-label={`${rating}点`}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  )
}

function GoogleRating({ placeId }: { placeId: string }) {
  const [data, setData] = useState<PlaceRating | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/place/${placeId}`)
      .then((r) => r.json())
      .then((d: PlaceRating) => setData(d))
      .catch(() => setData({ rating: null, user_ratings_total: null }))
      .finally(() => setLoading(false))
  }, [placeId])

  if (loading) {
    return <span className="text-xs text-gray-400 animate-pulse">評価取得中...</span>
  }
  if (!data?.rating) return null

  return (
    <div className="mt-1">
      <div className="flex items-center gap-1 flex-wrap">
        <StarRating rating={data.rating} />
        <span className="text-xs font-semibold text-gray-700">{data.rating.toFixed(1)}</span>
        {data.user_ratings_total != null && (
          <span className="text-xs text-gray-500">({data.user_ratings_total.toLocaleString()}件)</span>
        )}
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query_place_id=${placeId}&query=Google+Maps`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:underline"
      >
        Googleマップで口コミを見る →
      </a>
    </div>
  )
}

const SCHEDULE_INITIAL = 3

function ScheduleList({ lesson }: { lesson: Lesson }) {
  const [expanded, setExpanded] = useState(false)
  const schedules = lesson.schedules?.filter((s) => s.weekday) ?? []
  if (schedules.length === 0) return null
  const visible = expanded ? schedules : schedules.slice(0, SCHEDULE_INITIAL)
  return (
    <div className="text-gray-600 mb-1">
      <div>
        {visible.map((s, i) => (
          <span key={i} className="mr-2 whitespace-nowrap">
            🗓 {s.start_time ? `${s.weekday} ${s.start_time}〜` : s.weekday}
          </span>
        ))}
      </div>
      {schedules.length > SCHEDULE_INITIAL && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-blue-500 hover:underline mt-0.5"
        >
          {expanded ? '▲ 閉じる' : `▼ 他${schedules.length - SCHEDULE_INITIAL}件を表示`}
        </button>
      )}
    </div>
  )
}

type Props = {
  lesson: Lesson
}

export default function MarkerPopup({ lesson }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={scrollRef} className="min-w-[220px] max-h-[320px] overflow-y-auto text-sm">
      <div className="font-bold text-base mb-1">{lesson.name}</div>
      <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded mb-1">
        {lesson.category}
      </div>
      {lesson.google_place_id && (
        <GoogleRating placeId={lesson.google_place_id} />
      )}
      {lesson.address && (
        <div className="text-gray-600 mt-1 mb-1">
          📍 {lesson.address}
        </div>
      )}
      {lesson.target_age && (
        <div className="text-gray-600 mb-1">
          👶 {lesson.target_age}
        </div>
      )}
      <ScheduleList lesson={lesson} />
      {lesson.phone && (
        <div className="text-gray-600 mb-1">
          📞 {lesson.phone}
        </div>
      )}
      {lesson.website && (
        <div className="mt-2">
          <a
            href={lesson.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-xs font-semibold bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded px-3 py-1.5 transition-colors"
            style={{ color: '#ffffff' }}
          >
            🌐 公式サイトを見る →
          </a>
        </div>
      )}
    </div>
  )
}
