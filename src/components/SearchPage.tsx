'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Lesson, FilterState } from '@/types/lesson'
import { filterLessons } from '@/lib/filterLessons'
import DynamicMap from '@/components/Map/DynamicMap'
import CategoryFilter from '@/components/Sidebar/CategoryFilter'
import AgeFilter from '@/components/Sidebar/AgeFilter'
import WeekdayFilter from '@/components/Sidebar/WeekdayFilter'
import TimeFilter from '@/components/Sidebar/TimeFilter'
import LessonCard from '@/components/LessonCard'
import LessonDetailModal from '@/components/LessonDetailModal'

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
  const [modalLesson, setModalLesson] = useState<Lesson | null>(null)
  const [navTarget, setNavTarget] = useState<NavTarget | null>(null)
  // モバイル: サイドバーはデフォルト閉じ、デスクトップ: デフォルト開く
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const mapRef = useRef<HTMLElement>(null)
  const [mapHeight, setMapHeight] = useState(0)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    // 画面幅に応じてサイドバーの初期状態を決める
    setSidebarOpen(window.innerWidth >= 640)
  }, [])

  useEffect(() => {
    const update = () => {
      if (mapRef.current) {
        const top = mapRef.current.getBoundingClientRect().top
        setMapHeight(window.innerHeight - top)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

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
      setNavTarget({ lat: lesson.lat, lng: lesson.lng, key: Date.now() })
    }
    // サイドバーのカードへスクロール
    setTimeout(() => {
      cardRefs.current[lesson.name]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }, [])

  // マーカークリック時: カードハイライト（モバイルはサイドバーを開かない）
  const handleMarkerClick = useCallback((lesson: Lesson) => {
    setActiveLesson(lesson)
    const isMobile = window.innerWidth < 640
    if (!isMobile) {
      setSidebarOpen(true)
      setTimeout(() => {
        cardRefs.current[lesson.name]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 200)
    }
  }, [])

  const resetFilter = () => {
    setFilter(DEFAULT_FILTER)
    setActiveLesson(null)
    setNavTarget(null)
  }

  const isFiltered =
    filter.categories.length > 0 ||
    filter.targetAge !== null ||
    filter.weekdays.length > 0 ||
    filter.timeStart !== null ||
    filter.timeEnd !== null

  return (
    <>
      <div className="flex h-full overflow-hidden relative">
        {/* モバイル用オーバーレイ（サイドバー表示中に地図側をタップで閉じる） */}
        {sidebarOpen && (
          <div
            className="sm:hidden absolute inset-0 z-[1050] bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-200 overflow-hidden
            sm:relative sm:z-auto
            absolute z-[1100] top-0 bottom-0 left-0
            ${sidebarOpen ? 'w-72 min-w-[18rem]' : 'w-0'}
          `}
        >
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* フィルタパネル */}
            <div className="p-3 border-b border-gray-200 space-y-4 shrink-0 overflow-y-auto max-h-[55vh] sm:max-h-none">
              <CategoryFilter
                selected={filter.categories}
                onChange={(v) => updateFilter('categories', v)}
              />
              <AgeFilter
                selected={filter.targetAge}
                onChange={(v) => updateFilter('targetAge', v)}
              />
              <WeekdayFilter
                selected={filter.weekdays}
                onChange={(v) => updateFilter('weekdays', v)}
              />
              <TimeFilter
                timeStart={filter.timeStart}
                timeEnd={filter.timeEnd}
                onChange={(start, end) => {
                  setFilter((prev) => ({ ...prev, timeStart: start, timeEnd: end }))
                }}
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

            {/* カードリスト */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1.5">
              {mappable.map((lesson) => (
                <div
                  key={lesson.name}
                  ref={(el) => { cardRefs.current[lesson.name] = el }}
                >
                  <LessonCard
                    lesson={lesson}
                    isActive={activeLesson?.name === lesson.name}
                    onClick={() => handleSelectLesson(lesson)}
                  />
                </div>
              ))}

              {noLocation.length > 0 && (
                <>
                  <div className="pt-2 pb-1 px-1">
                    <span className="text-xs text-gray-400 font-medium">
                      📍 住所未取得（{noLocation.length}件）
                    </span>
                  </div>
                  {noLocation.map((lesson, i) => (
                    <div
                      key={`no-loc-${i}`}
                      ref={(el) => { cardRefs.current[lesson.name] = el }}
                    >
                      <LessonCard
                        lesson={lesson}
                        isActive={activeLesson?.name === lesson.name}
                        onClick={() => setModalLesson(lesson)}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </aside>

        {/* サイドバー開閉ボタン */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute top-1/2 -translate-y-1/2 z-[1000] bg-white border border-gray-200 rounded-r px-1 py-3 shadow text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
          style={{ left: sidebarOpen ? '18rem' : '0' }}
          title={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        <main
          ref={mapRef}
          className="flex-1 relative"
          style={{ height: mapHeight || '100vh' }}
        >
          <DynamicMap
            lessons={mappable}
            activeLesson={activeLesson}
            navTarget={navTarget}
            onSelectLesson={handleMarkerClick}
            sidebarOpen={sidebarOpen}
          />
        </main>
      </div>

      {/* 詳細モーダル */}
      {modalLesson && (
        <LessonDetailModal
          lesson={modalLesson}
          onClose={() => setModalLesson(null)}
        />
      )}
    </>
  )
}
