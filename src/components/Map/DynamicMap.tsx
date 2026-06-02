'use client'

import dynamic from 'next/dynamic'
import type { Lesson } from '@/types/lesson'
import type { FlyTarget } from '@/components/SearchPage'

// Leaflet は SSR 非対応のため dynamic import で回避
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
  flyTarget?: FlyTarget | null
}

export default function DynamicMap({ lessons, activeLesson, flyTarget }: Props) {
  return <MapView lessons={lessons} activeLesson={activeLesson} flyTarget={flyTarget} />
}
