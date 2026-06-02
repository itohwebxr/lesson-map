'use client'

/**
 * Leaflet の Map インスタンスを window に保存して共有するモジュール。
 * Turbopack がモジュールを別チャンクに分割しても、window は共通なので確実に動作する。
 */
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

  /** 指定座標を画面中央に移動する（autopan なし） */
  moveTo: (lat: number, lng: number, zoom = 15) => {
    const map = window.__lessonMap
    if (!map) return
    map.setView([lat, lng], zoom, { animate: false })
  },
}
