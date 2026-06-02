'use client'

/**
 * Leaflet の Map インスタンスを window に保存して共有するモジュール。
 * Turbopack がモジュールを別チャンクに分割しても、window は共通なので確実に動作する。
 */
import type L from 'leaflet'

type MoveEndCallback = (lat: number, lng: number, zoom: number) => void

declare global {
  interface Window {
    __lessonMap?: L.Map
    __lessonMapCb?: MoveEndCallback
  }
}

export const mapInstance = {
  register: (map: L.Map) => {
    window.__lessonMap = map
    map.on('moveend', () => {
      const cb = window.__lessonMapCb
      if (cb) {
        const c = map.getCenter()
        cb(c.lat, c.lng, map.getZoom())
      }
    })
  },

  unregister: () => {
    delete window.__lessonMap
  },

  isReady: () => typeof window !== 'undefined' && !!window.__lessonMap,

  setMoveEndCallback: (cb: MoveEndCallback) => {
    if (typeof window !== 'undefined') window.__lessonMapCb = cb
  },

  flyTo: (lat: number, lng: number, zoom = 15) => {
    const map = window.__lessonMap
    if (!map) return
    map.setView([lat, lng], zoom)
  },
}
