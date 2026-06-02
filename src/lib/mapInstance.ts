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
    if (!_map) return
    // アニメーションなしの setView で確実に移動させる
    _map.setView([lat, lng], zoom)
    // setView は同期的なので、直後に中心座標を取得できる
    const c = _map.getCenter()
    if (_onMoveEnd) _onMoveEnd(c.lat, c.lng, _map.getZoom())
  },
}
