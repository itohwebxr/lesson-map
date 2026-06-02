export default function Loading() {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* サイドバースケルトン */}
        <aside className="w-72 bg-gray-50 border-r border-gray-200 p-3 space-y-3 hidden sm:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </aside>
        {/* 地図スケルトン */}
        <main className="flex-1 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm animate-pulse">地図を読み込み中...</span>
        </main>
      </div>
    </div>
  )
}
