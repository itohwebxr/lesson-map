'use client'

import { useEffect, useState } from 'react'
import type { Lesson } from '@/types/lesson'
import type { PlaceRating } from '@/app/api/place/[placeId]/route'
import DataQualityBadge from '@/components/DataQualityBadge'
import { trackEvent, GA_EVENTS } from '@/lib/gtm'

const CATEGORY_ICONS: Record<string, string> = {
  'サッカー': '⚽', 'スイミング': '🏊', 'ダンス': '💃', '体操': '🤸',
  '英会話': '🌏', '学習塾': '📚', 'ピアノ': '🎹', 'プログラミング': '💻',
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span className="text-yellow-400 text-sm" aria-label={`${rating}点`}>
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
    return <span className="text-xs text-gray-400 animate-pulse">評価を取得中...</span>
  }

  if (!data?.rating) {
    return <span className="text-xs text-gray-400">評価情報なし</span>
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <StarRating rating={data.rating} />
      <span className="text-sm font-semibold text-gray-700">{data.rating.toFixed(1)}</span>
      {data.user_ratings_total != null && (
        <span className="text-xs text-gray-500">口コミ {data.user_ratings_total.toLocaleString()}件</span>
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query_place_id=${placeId}&query=Google+Maps`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:underline ml-1"
      >
        Googleマップで口コミを見る →
      </a>
    </div>
  )
}

type Props = {
  lesson: Lesson
  onClose: () => void
}

export default function LessonDetailModal({ lesson, onClose }: Props) {
  useEffect(() => {
    trackEvent(GA_EVENTS.LESSON_DETAIL_VIEW, {
      lesson_name: lesson.name,
      category: lesson.category,
      city: lesson.city ?? '',
    })
  }, [lesson])

  // ESCキーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const schedules = lesson.schedules?.filter((s) => s.weekday || s.start_time) ?? []

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/40" />

      {/* モーダル本体 */}
      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-gray-800 leading-snug">
                {lesson.name}
              </span>
              <span className="text-xl" title={lesson.category}>
                {CATEGORY_ICONS[lesson.category] ?? '📍'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {lesson.category}
              </span>
              {lesson.data_quality && <DataQualityBadge quality={lesson.data_quality} />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* 詳細内容 */}
        <div className="px-4 py-4 space-y-3 text-sm">
          {/* Google評価 */}
          <div className="flex gap-2 items-start">
            <span className="shrink-0">⭐</span>
            {lesson.google_place_id
              ? <GoogleRating placeId={lesson.google_place_id} />
              : <span className="text-xs text-gray-400">評価情報なし</span>
            }
          </div>

          {lesson.address && (
            <div className="flex gap-2">
              <span className="shrink-0">📍</span>
              <span className="text-gray-700">{lesson.address}</span>
            </div>
          )}

          {lesson.target_age && (
            <div className="flex gap-2">
              <span className="shrink-0">👶</span>
              <span className="text-gray-700">{lesson.target_age}</span>
            </div>
          )}

          {lesson.price && (
            <div className="flex gap-2">
              <span className="shrink-0">💴</span>
              <span className="text-gray-700">{lesson.price}</span>
            </div>
          )}

          {lesson.phone && (
            <div className="flex gap-2">
              <span className="shrink-0">📞</span>
              <a
                href={`tel:${lesson.phone}`}
                className="text-blue-600 underline"
              >
                {lesson.phone}
              </a>
            </div>
          )}

          {schedules.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">🗓 スケジュール</p>
              <div className="space-y-1">
                {schedules.map((s, i) => (
                  <div key={i} className="text-gray-700 text-xs bg-gray-50 rounded px-2 py-1">
                    {s.weekday && <span className="font-medium">{s.weekday}</span>}
                    {s.start_time && (
                      <span className="ml-2">
                        {s.start_time}{s.end_time ? `〜${s.end_time}` : '〜'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {lesson.organization_type && (
            <div className="text-xs text-gray-400">
              種別: {lesson.organization_type}
            </div>
          )}
        </div>

        {/* フッター：公式サイトリンク */}
        {lesson.website && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
            <a
              href={lesson.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              onClick={() =>
                trackEvent(GA_EVENTS.LESSON_WEBSITE_CLICK, {
                  lesson_name: lesson.name,
                  category: lesson.category,
                  url: lesson.website!,
                })
              }
            >
              🌐 公式サイトを見る
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
