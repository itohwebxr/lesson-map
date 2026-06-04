'use client'

import { useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import type { Lesson } from '@/types/lesson'
import type { NavTarget } from '@/components/SearchPage'
import LessonMarker from './LessonMarker'
import { trackEvent, GA_EVENTS } from '@/lib/gtm'

// カテゴリ → [絵文字, 背景色]
const CATEGORY_STYLE: Record<string, [string, string]> = {
  'サッカー':         ['⚽', '#16a34a'],
  'スイミング':       ['🏊', '#0284c7'],
  'ダンス':           ['💃', '#db2777'],
  'バレエ':           ['🩰', '#9333ea'],
  '体操':             ['🤸', '#ea580c'],
  '英会話':           ['🌏', '#0891b2'],
  '学習塾':           ['📚', '#4f46e5'],
  'ピアノ':           ['🎹', '#7c3aed'],
  'プログラミング':   ['💻', '#0f766e'],
  '武道':             ['🥋', '#b45309'],
  'テニス':           ['🎾', '#65a30d'],
  'バスケ': ['🏀', '#c2410c'],
  '野球':             ['⚾', '#1d4ed8'],
  '習字':             ['🖌️', '#6b7280'],
  'そろばん':         ['🧮', '#92400e'],
  '幼児教室':         ['🧸', '#be185d'],
}

const DEFAULT_STYLE: [string, string] = ['📍', '#6b7280']

function makeCategoryIcon(category: string, isActive: boolean) {
  const [emoji, color] = CATEGORY_STYLE[category] ?? DEFAULT_STYLE
  const bg = isActive ? '#f97316' : color
  const size = isActive ? 36 : 30
  const html = `
    <div style="
      width:${size}px; height:${size}px;
      background:${bg};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex; align-items:center; justify-content:center;
    ">
      <span style="transform:rotate(45deg); font-size:${isActive ? 17 : 14}px; line-height:1;">${emoji}</span>
    </div>`
  return L.divIcon({
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
    className: '',
  })
}

type Props = {
  lessons: Lesson[]
  activeLesson?: Lesson | null
  navTarget?: NavTarget | null
  onSelectLesson?: (lesson: Lesson) => void
  sidebarOpen?: boolean
}

function NavController({ navTarget }: { navTarget?: NavTarget | null }) {
  const map = useMap()
  const prevKey = useRef<number | null>(null)

  useEffect(() => {
    if (!navTarget) return
    if (navTarget.key === prevKey.current) return
    prevKey.current = navTarget.key
    map.setView([navTarget.lat, navTarget.lng], 15)
    const handleMoveEnd = () => map.invalidateSize()
    map.once('moveend', handleMoveEnd)
    return () => { map.off('moveend', handleMoveEnd) }
  }, [navTarget, map])

  return null
}

// セッション内で初回の地図操作のみ map_engagement を送信する
function MapEngagementController() {
  const map = useMap()
  const firedRef = useRef(false)

  useEffect(() => {
    const handler = () => {
      if (firedRef.current) return
      firedRef.current = true
      const center = map.getCenter()
      trackEvent(GA_EVENTS.MAP_ENGAGEMENT, {
        center_lat: Math.round(center.lat * 10000) / 10000,
        center_lng: Math.round(center.lng * 10000) / 10000,
        zoom: map.getZoom(),
      })
    }
    map.on('moveend', handler)
    return () => { map.off('moveend', handler) }
  }, [map])

  return null
}

// サイドバー開閉トランジション完了後に地図サイズを再計算する
function SidebarResizeController({ sidebarOpen }: { sidebarOpen?: boolean }) {
  const map = useMap()

  useEffect(() => {
    // transition-duration: 200ms に合わせて完了後に呼ぶ
    const timer = setTimeout(() => map.invalidateSize(), 210)
    return () => clearTimeout(timer)
  }, [sidebarOpen, map])

  return null
}

export default function MapView({ lessons, activeLesson, navTarget, onSelectLesson, sidebarOpen }: Props) {
  const markerRefs = useRef<Record<string, L.Marker>>({})

  return (
    <MapContainer
      center={[35.0045, 135.8686]}
      zoom={12}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <NavController navTarget={navTarget} />
      <SidebarResizeController sidebarOpen={sidebarOpen} />
      <MapEngagementController />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lessons.filter((l) => l.lat != null && l.lng != null).map((lesson) => {
        const isActive = activeLesson?.name === lesson.name
        return (
          <LessonMarker
            key={lesson.name}
            lesson={lesson}
            icon={makeCategoryIcon(lesson.category, isActive)}
            isActive={isActive}
            onSelect={onSelectLesson ?? (() => {})}
            markerRef={(m) => {
              if (m) markerRefs.current[lesson.name] = m
              else delete markerRefs.current[lesson.name]
            }}
          />
        )
      })}
    </MapContainer>
  )
}
