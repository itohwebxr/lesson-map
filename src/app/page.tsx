import Image from 'next/image'
import { loadLessons } from '@/lib/loadLessons'
import { withDataQuality } from '@/lib/dataQuality'
import SearchPage from '@/components/SearchPage'

export default function Home() {
  const lessons = withDataQuality(loadLessons())

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="LessonMap" width={36} height={36} className="rounded-lg" />
          <span className="text-xl font-bold text-blue-600">LessonMap</span>
          <span className="text-sm text-gray-500 hidden sm:inline">
            滋賀県の習い事を探す
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400 hidden sm:block">
            全{lessons.length}件収録
          </div>
          <a
            href="https://forms.gle/WZtdQwazezR8AMSi6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow transition-colors"
          >
            <span>✏️</span>
            <span>掲載情報の修正・掲載依頼・ご意見はこちら</span>
          </a>
        </div>
      </header>

      {/* min-h-0 で flex子要素が正しく高さを制限できる */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SearchPage lessons={lessons} />
      </div>
    </div>
  )
}
