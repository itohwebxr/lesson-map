'use client'

import { useCallback, useRef, useEffect } from 'react'
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

  // isActive が true になったらポップアップを開く
  useEffect(() => {
    if (!isActive) return
    const timer = setTimeout(() => internalRef.current?.openPopup(), 150)
    return () => clearTimeout(timer)
  }, [isActive])

  const handleClick = useCallback(() => {
    onSelect(lesson)
  }, [lesson, onSelect])

  return (
    <Marker
      position={[lesson.lat!, lesson.lng!]}
      icon={icon}
      zIndexOffset={isActive ? 1000 : 0}
      ref={(m) => {
        internalRef.current = m
        markerRef(m)
      }}
      eventHandlers={{ click: handleClick }}
    >
      <Popup maxWidth={280} autoPan={false}>
        <MarkerPopup lesson={lesson} />
      </Popup>
    </Marker>
  )
}
