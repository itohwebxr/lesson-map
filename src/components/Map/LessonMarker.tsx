'use client'

import { useRef, useEffect } from 'react'
import { Marker, Popup } from 'react-leaflet'
import type { Lesson } from '@/types/lesson'
import MarkerPopup from './MarkerPopup'
import type L from 'leaflet'

type Props = {
  lesson: Lesson
  icon: L.Icon | L.DivIcon
  isActive: boolean
  onSelect: (lesson: Lesson) => void
  markerRef: (m: L.Marker | null) => void
}

export default function LessonMarker({ lesson, icon, isActive, onSelect, markerRef }: Props) {
  const internalRef = useRef<L.Marker | null>(null)
  // onSelect を ref で保持してイベントリスナー内で常に最新版を呼べるようにする
  const onSelectRef = useRef(onSelect)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  // Leaflet ネイティブ API でクリックを登録（react-leaflet eventHandlers を使わない）
  useEffect(() => {
    const marker = internalRef.current
    if (!marker) return
    const handler = () => onSelectRef.current(lesson)
    marker.on('click', handler)
    return () => { marker.off('click', handler) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.name])

  // isActive になったらポップアップを開く
  useEffect(() => {
    if (!isActive) return
    const timer = setTimeout(() => internalRef.current?.openPopup(), 150)
    return () => clearTimeout(timer)
  }, [isActive])

  return (
    <Marker
      position={[lesson.lat!, lesson.lng!]}
      icon={icon}
      zIndexOffset={isActive ? 1000 : 0}
      ref={(m) => {
        internalRef.current = m
        markerRef(m)
      }}
    >
      <Popup maxWidth={280} autoPan={false}>
        <MarkerPopup lesson={lesson} />
      </Popup>
    </Marker>
  )
}
