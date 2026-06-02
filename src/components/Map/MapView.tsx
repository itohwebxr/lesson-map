'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Lesson } from '@/types/lesson'
import MarkerPopup from './MarkerPopup'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Props = {
  lessons: Lesson[]
  activeLesson?: Lesson | null
}

// カードクリック時に地図を移動してポップアップを開く
function FlyToActive({ lesson }: { lesson: Lesson | null | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (lesson?.lat && lesson?.lng) {
      map.flyTo([lesson.lat, lesson.lng], 15, { duration: 0.8 })
    }
  }, [lesson, map])
  return null
}

export default function MapView({ lessons, activeLesson }: Props) {
  const markerRefs = useRef<Record<string, L.Marker>>({})

  // activeLesson が変わったらそのポップアップを開く
  useEffect(() => {
    if (activeLesson) {
      const marker = markerRefs.current[activeLesson.name]
      marker?.openPopup()
    }
  }, [activeLesson])

  return (
    <MapContainer
      center={[35.0045, 135.8686]}
      zoom={12}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <FlyToActive lesson={activeLesson} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lessons.map((lesson, idx) => (
        <Marker
          key={idx}
          position={[lesson.lat!, lesson.lng!]}
          ref={(ref) => {
            if (ref) markerRefs.current[lesson.name] = ref
          }}
        >
          <Popup maxWidth={280}>
            <MarkerPopup lesson={lesson} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
