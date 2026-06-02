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

  /** 指定座標に移動し、その位置のマーカーのポップアップを自動で開く */
  flyToAndOpen: (lat: number, lng: number, zoom = 15) => {
    const map = window.__lessonMap
    if (!map) return
    map.setView([lat, lng], zoom)
    // setView 後にレイヤーを走査して座標が一致するマーカーのポップアップを開く
    map.eachLayer((layer) => {
      const m = layer as L.Marker
      if (typeof m.getLatLng !== 'function' || typeof m.openPopup !== 'function') return
      const pos = m.getLatLng()
      if (Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001) {
        m.openPopup()
      }
    })
  },
}
