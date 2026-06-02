import { loadLessons } from '@/lib/loadLessons'
import SearchPage from '@/components/SearchPage'

export default function Home() {
  const lessons = loadLessons()

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">🗺 LessonMap</span>
          <span className="text-sm text-gray-500 hidden sm:inline">
            大津市の習い事を探す
          </span>
        </div>
        <div className="text-xs text-gray-400">
          全{lessons.length}件収録
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <SearchPage lessons={lessons} />
      </div>
    </div>
  )
}
