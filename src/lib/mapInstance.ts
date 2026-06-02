/**
 * Leaflet の Map インスタンスをシングルトンとして保持するモジュール。
 * React の prop/state 伝播を一切使わず、クリック時に直接 flyTo を呼べる。
 */
import type L from 'leaflet'

let _map: L.Map | null = null

export const mapInstance = {
  register: (map: L.Map) => {
    _map = map
  },
  unregister: () => {
    _map = null
  },
  isReady: () => _map !== null,
  flyTo: (lat: number, lng: number, zoom = 15) => {
    _map?.flyTo([lat, lng], zoom, { duration: 0.5 })
  },
}
