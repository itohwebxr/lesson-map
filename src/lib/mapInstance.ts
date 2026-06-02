/**
 * Leaflet の Map インスタンスをシングルトンとして保持するモジュール。
 * React の prop/state 伝播を一切使わず、クリック時に直接 flyTo を呼べる。
 */
import type L from 'leaflet'

let _map: L.Map | null = null

type MoveEndCallback = (lat: number, lng: number, zoom: number) => void
let _onMoveEnd: MoveEndCallback | null = null

export const mapInstance = {
  register: (map: L.Map) => {
    _map = map
    // 地図が移動し終わったら実際の中心座標をコールバックで通知
    map.on('moveend', () => {
      if (_onMoveEnd) {
        const c = map.getCenter()
        _onMoveEnd(c.lat, c.lng, map.getZoom())
      }
    })
  },
  unregister: () => {
    _map = null
    _onMoveEnd = null
  },
  isReady: () => _map !== null,
  setMoveEndCallback: (cb: MoveEndCallback) => {
    _onMoveEnd = cb
  },
  flyTo: (lat: number, lng: number, zoom = 15) => {
    _map?.flyTo([lat, lng], zoom, { duration: 0.5 })
  },
}
