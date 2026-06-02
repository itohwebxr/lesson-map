'use client'

import { useState, useCallback } from 'react'
import type { Lesson, FilterState } from '@/types/lesson'
import { filterLessons } from '@/lib/filterLessons'
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

/** クリック時のナビゲーション先。key は Date.now() で毎回ユニーク */
export type NavTarget = { lat: number; lng: number; key: number }

type Props = { lessons: Lesson[] }

export default function SearchPage({ lessons }: Props) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [navTarget, setNavTarget] = useState<NavTarget | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const filtered = filterLessons(lessons, filter)
  const mappable = filtered.filter((l) => l.address !== null && l.lat !== undefined)
  const noLocation = filtered.filter((l) => l.address === null)

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
      setFilter((prev) => ({ ...prev, [key]: value })),
    []
  )

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setActiveLesson(lesson)
    if (lesson.lat != null && lesson.lng != null) {
      // key を Date.now() にすることで同じ教室を連続クリックしても確実に発火
      setNavTarget({ lat: lesson.lat, lng: lesson.lng, key: Date.now() })
    }
  }, [])

  const resetFilter = () => {
    setFilter(DEFAULT_FILTER)
    setActiveLesson(null)
    setNavTarget(null)
  }

  const isFiltered = filter.categories.length > 0 || filter.targetAge !== null

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside
        className={`flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-200 overflow-hidden ${
          sidebarOpen ? 'w-72 min-w-[18rem]' : 'w-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
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

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {mappable.map((lesson) => (
              <LessonCard
                key={lesson.name}
                lesson={lesson}
                isActive={activeLesson?.name === lesson.name}
                onClick={() => handleSelectLesson(lesson)}
              />
            ))}

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

      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-[1000] bg-white border border-gray-200 rounded-r px-1 py-3 shadow text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        style={{ left: sidebarOpen ? '18rem' : '0' }}
        title={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      <main className="flex-1 relative">
        <DynamicMap lessons={mappable} activeLesson={activeLesson} navTarget={navTarget} />
      </main>
    </div>
  )
}
