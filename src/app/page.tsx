import { loadLessons } from '@/lib/loadLessons'
import DynamicMap from '@/components/Map/DynamicMap'

export default function Home() {
  const lessons = loadLessons()
  const mappableCount = lessons.filter((l) => l.lat !== undefined).length

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">🗺 LessonMap</span>
          <span className="text-sm text-gray-500 hidden sm:inline">
            大津市の習い事を探す
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {mappableCount}件の教室を表示中
        </div>
      </header>

      {/* 地図エリア（フル画面） */}
      <main className="flex-1 relative">
        <DynamicMap lessons={lessons} />
      </main>
    </div>
  )
}
