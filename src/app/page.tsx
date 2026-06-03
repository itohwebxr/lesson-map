import { loadLessons } from '@/lib/loadLessons'
import { withDataQuality } from '@/lib/dataQuality'
import SearchPage from '@/components/SearchPage'
import AppHeader from '@/components/AppHeader'

export default function Home() {
  const lessons = withDataQuality(loadLessons())

  return (
    <div className="flex flex-col h-screen">
      <AppHeader lessonCount={lessons.length} />

      {/* min-h-0 で flex子要素が正しく高さを制限できる */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SearchPage lessons={lessons} />
      </div>
    </div>
  )
}
