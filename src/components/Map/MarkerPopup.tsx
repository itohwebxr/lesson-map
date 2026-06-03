'use client'

import { useState, useEffect } from 'react'
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
    <div className="flex items-center gap-1 flex-wrap mt-1">
      <StarRating rating={data.rating} />
      <span className="text-xs font-semibold text-gray-700">{data.rating.toFixed(1)}</span>
      {data.user_ratings_total != null && (
        <span className="text-xs text-gray-500">({data.user_ratings_total.toLocaleString()}件)</span>
      )}
    </div>
  )
}

type Props = {
  lesson: Lesson
}

export default function MarkerPopup({ lesson }: Props) {
  return (
    <div className="min-w-[220px] text-sm">
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
      {lesson.phone && (
        <div className="text-gray-600 mb-1">
          📞 {lesson.phone}
        </div>
      )}
      {lesson.website && (
        <div className="mt-1">
          <a
            href={lesson.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-xs"
          >
            🌐 公式サイトを見る →
          </a>
        </div>
      )}
    </div>
  )
}
