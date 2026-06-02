'use client'

import type L from 'leaflet'

declare global {
  interface Window {
    __lessonMap?: L.Map
  }
}

export const mapInstance = {
  register: (map: L.Map) => {
    window.__lessonMap = map
  },
  unregister: () => {
    delete window.__lessonMap
  },
  isReady: () => typeof window !== 'undefined' && !!window.__lessonMap,
  moveTo: (lat: number, lng: number, zoom = 15) => {
    window.__lessonMap?.setView([lat, lng], zoom)
  },
}
