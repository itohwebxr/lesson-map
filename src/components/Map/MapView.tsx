'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Lesson } from '@/types/lesson'
import MarkerPopup from './MarkerPopup'

// Leaflet デフォルトアイコンの修正（Next.js SSR対策）
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Props = {
  lessons: Lesson[]
}

// 地図の中心を大津市に固定するコンポーネント
function MapCenter() {
  const map = useMap()
  useEffect(() => {
    map.setView([35.0045, 135.8686], 12)
  }, [map])
  return null
}

export default function MapView({ lessons }: Props) {
  const mappableLessons = lessons.filter(
    (l) => l.lat !== undefined && l.lng !== undefined
  )

  return (
    <MapContainer
      center={[35.0045, 135.8686]}
      zoom={12}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <MapCenter />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mappableLessons.map((lesson, idx) => (
        <Marker key={idx} position={[lesson.lat!, lesson.lng!]}>
          <Popup maxWidth={280}>
            <MarkerPopup lesson={lesson} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
