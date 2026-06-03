'use client'

import dynamic from 'next/dynamic'
import type { Lesson } from '@/types/lesson'
import type { NavTarget } from '@/components/SearchPage'

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <span className="text-gray-500">地図を読み込み中...</span>
    </div>
  ),
})

type Props = {
  lessons: Lesson[]
  activeLesson?: Lesson | null
  navTarget?: NavTarget | null
  onSelectLesson?: (lesson: Lesson) => void
}

export default function DynamicMap({ lessons, activeLesson, navTarget, onSelectLesson }: Props) {
  return <MapView lessons={lessons} activeLesson={activeLesson} navTarget={navTarget} onSelectLesson={onSelectLesson} />
}
