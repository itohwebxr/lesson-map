'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Lesson } from '@/types/lesson'
import type { FlyTarget } from '@/components/SearchPage'
import MarkerPopup from './MarkerPopup'

// デフォルトアイコン（青）
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// アクティブアイコン（オレンジ）
const activeIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#f97316"/>
    <circle cx="12.5" cy="12.5" r="5" fill="white"/>
  </svg>`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: '',
})

type Props = {
  lessons: Lesson[]
  activeLesson?: Lesson | null
  flyTarget?: FlyTarget | null
}

// flyTarget.key が変わるたびに必ず flyTo を実行する
// key は Date.now() で毎回ユニークなので、同じ教室を連続クリックしても確実に動く
function FlyToTarget({ flyTarget }: { flyTarget?: FlyTarget | null }) {
  const map = useMap()
  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], 15, { duration: 0.6 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget?.key]) // key は number（primitive）なので確実に比較できる
  return null
}

export default function MapView({ lessons, activeLesson, flyTarget }: Props) {
  return (
    <MapContainer
      center={[35.0045, 135.8686]}
      zoom={12}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <FlyToTarget flyTarget={flyTarget} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lessons.map((lesson) => {
        const isActive = activeLesson?.name === lesson.name
        return (
          <Marker
            key={lesson.name}
            position={[lesson.lat!, lesson.lng!]}
            icon={isActive ? activeIcon : defaultIcon}
            zIndexOffset={isActive ? 1000 : 0}
          >
            <Popup maxWidth={280}>
              <MarkerPopup lesson={lesson} />
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
