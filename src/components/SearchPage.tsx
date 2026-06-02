'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Lesson, FilterState } from '@/types/lesson'
import { filterLessons } from '@/lib/filterLessons'
import { mapInstance } from '@/lib/mapInstance'
import DynamicMap from '@/components/Map/DynamicMap'
import CategoryFilter from '@/components/Sidebar/CategoryFilter'
import AgeFilter from '@/components/Sidebar/AgeFilter'
import LessonCard from '@/components/LessonCard'

const DEFAULT_FILTER: FilterState = {
  categories: [],
  weekdays: [],
  timeStart: null,
  timeEnd: null,
  targetAge: null,
}

type Props = { lessons: Lesson[] }

export default function SearchPage({ lessons }: Props) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // デバッグ用
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [actualCenter, setActualCenter] = useState<string | null>(null)
  const [gMapsUrl, setGMapsUrl] = useState<string | null>(null)

  // useEffect で正しくコールバックを登録
  useEffect(() => {
    mapInstance.setMoveEndCallback((lat, lng, zoom) => {
      setActualCenter(`実際の移動先: lat=${lat.toFixed(5)}, lng=${lng.toFixed(5)}, zoom=${zoom}`)
    })
  }, [])

  const filtered = filterLessons(lessons, filter)
  // 住所あり＆座標あり → 地図に表示
  const mappable = filtered.filter((l) => l.address !== null && l.lat !== undefined)
  // 住所なし → サイドバーのみ表示
  const noLocation = filtered.filter((l) => l.address === null)

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
      setFilter((prev) => ({ ...prev, [key]: value })),
    []
  )

  // カードクリック：state更新 + 地図を即座に移動
  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setActiveLesson(lesson)
    const lat = lesson.lat
    const lng = lesson.lng
    const ready = mapInstance.isReady()
    // デバッグ情報を表示
    setDebugInfo(
      `【${lesson.name}】 lat=${lat?.toFixed(5) ?? 'null'}, lng=${lng?.toFixed(5) ?? 'null'}, 地図=${ready ? '✅登録済' : '❌未登録'}`
    )
    if (lat != null && lng != null) {
      setGMapsUrl(`https://www.google.com/maps?q=${lat},${lng}&z=17`)
      mapInstance.flyTo(lat, lng)
    }
  }, [])

  const resetFilter = () => {
    setFilter(DEFAULT_FILTER)
    setActiveLesson(null)
  }

  const isFiltered =
    filter.categories.length > 0 || filter.targetAge !== null

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* デバッグバー（調査用・後で削除） */}
      {debugInfo && (
        <div className="shrink-0 bg-yellow-100 border-b border-yellow-300 px-3 py-1 text-xs font-mono text-yellow-900 truncate">
          🔍 指定: {debugInfo}
        </div>
      )}
      {actualCenter && (
        <div className="shrink-0 bg-green-100 border-b border-green-300 px-3 py-1 text-xs font-mono text-green-900 flex items-center gap-3">
          <span className="truncate">📍 {actualCenter}</span>
          {gMapsUrl && (
            <a
              href={gMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 underline text-blue-700 font-sans"
            >
              Googleマップで確認 →
            </a>
          )}
        </div>
      )}
    <div className="flex flex-1 overflow-hidden">
      {/* サイドバー */}
      <aside
        className={`flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-200 overflow-hidden ${
          sidebarOpen ? 'w-72 min-w-[18rem]' : 'w-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* フィルターパネル */}
          <div className="p-3 border-b border-gray-200 space-y-4 shrink-0">
            <CategoryFilter
              selected={filter.categories}
              onChange={(v) => updateFilter('categories', v)}
            />
            <AgeFilter
              selected={filter.targetAge}
              onChange={(v) => updateFilter('targetAge', v)}
            />
            {isFiltered && (
              <button
                onClick={resetFilter}
                className="w-full text-xs text-gray-500 hover:text-gray-700 underline text-center"
              >
                🔄 フィルターをリセット
              </button>
            )}
          </div>

          {/* 件数 */}
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 shrink-0">
            {isFiltered ? (
              <span>
                <span className="font-semibold text-blue-600">{filtered.length}件</span>
                {' '}表示中（全{lessons.length}件）
              </span>
            ) : (
              <span>全<span className="font-semibold">{lessons.length}</span>件</span>
            )}
          </div>

          {/* 教室リスト */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {mappable.map((lesson) => (
              <LessonCard
                key={lesson.name}
                lesson={lesson}
                isActive={activeLesson?.name === lesson.name}
                onClick={() => handleSelectLesson(lesson)}
              />
            ))}

            {/* 住所未取得（地図に表示しない） */}
            {noLocation.length > 0 && (
              <>
                <div className="pt-2 pb-1 px-1">
                  <span className="text-xs text-gray-400 font-medium">
                    📍 住所未取得（{noLocation.length}件）
                  </span>
                </div>
                {noLocation.map((lesson, i) => (
                  <LessonCard key={`no-loc-${i}`} lesson={lesson} />
                ))}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* サイドバー開閉ボタン */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-[1000] bg-white border border-gray-200 rounded-r px-1 py-3 shadow text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        style={{ left: sidebarOpen ? '18rem' : '0' }}
        title={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* 地図 */}
      <main className="flex-1 relative">
        <DynamicMap lessons={mappable} activeLesson={activeLesson} />
      </main>
    </div>
    </div>
  )
}
