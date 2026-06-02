'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Lesson } from '@/types/lesson'
import type { NavTarget } from '@/components/SearchPage'
import MarkerPopup from './MarkerPopup'

function makeIcon(fill: string) {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${fill}"/>
      <circle cx="12.5" cy="12.5" r="5" fill="white"/>
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: '',
  })
}

const qualityIcons = {
  high:   makeIcon('#22c55e'),  // 緑
  medium: makeIcon('#eab308'),  // 黄
  low:    makeIcon('#9ca3af'),  // 灰
}

const activeIcon = makeIcon('#f97316')  // オレンジ（選択中）

type Props = {
  lessons: Lesson[]
  activeLesson?: Lesson | null
  navTarget?: NavTarget | null
  onSelectLesson?: (lesson: Lesson) => void
}

/**
 * MapContainer の内側で useMap() を使い setView を呼ぶ。
 * react-leaflet の管理下にある正規のインスタンスを使うことで確実に動作する。
 * key（Date.now()）が変わるたびに useEffect が再実行される。
 */
function NavController({ navTarget }: { navTarget?: NavTarget | null }) {
  const map = useMap()
  const prevKey = useRef<number | null>(null)

  useEffect(() => {
    if (!navTarget) return
    if (navTarget.key === prevKey.current) return
    prevKey.current = navTarget.key

    map.setView([navTarget.lat, navTarget.lng], 15)

    // 移動完了後に invalidateSize() でタイル描画ズレを解消
    const handleMoveEnd = () => map.invalidateSize()
    map.once('moveend', handleMoveEnd)
    return () => { map.off('moveend', handleMoveEnd) }
  }, [navTarget, map])

  return null
}

export default function MapView({ lessons, activeLesson, navTarget, onSelectLesson }: Props) {
  const markerRefs = useRef<Record<string, L.Marker>>({})

  // activeLesson が変わったらポップアップを開く（autoPan=false なので地図は動かない）
  useEffect(() => {
    if (!activeLesson) return
    const marker = markerRefs.current[activeLesson.name]
    if (!marker) return
    const timer = setTimeout(() => marker.openPopup(), 150)
    return () => clearTimeout(timer)
  }, [activeLesson])

  return (
    <MapContainer
      center={[35.0045, 135.8686]}
      zoom={12}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <NavController navTarget={navTarget} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lessons.map((lesson) => {
        const isActive = activeLesson?.name === lesson.name
        const qualityIcon = qualityIcons[lesson.data_quality ?? 'low']
        return (
          <Marker
            key={lesson.name}
            position={[lesson.lat!, lesson.lng!]}
            icon={isActive ? activeIcon : qualityIcon}
            zIndexOffset={isActive ? 1000 : 0}
            ref={(m) => {
              if (m) markerRefs.current[lesson.name] = m
              else delete markerRefs.current[lesson.name]
            }}
            eventHandlers={{
              click: () => onSelectLesson?.(lesson),
            }}
          >
            <Popup maxWidth={280} autoPan={false}>
              <MarkerPopup lesson={lesson} />
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
