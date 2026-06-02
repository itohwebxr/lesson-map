const API_KEY = process.env.GOOGLE_MAPS_API_KEY
if (!API_KEY) { console.error('GOOGLE_MAPS_API_KEY 未設定'); process.exit(1) }

const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent('滋賀県大津市打出浜33-11')}&language=ja&region=jp&key=${API_KEY}`)
const d = await res.json()
console.log('status:', d.status)
if (d.results?.length) {
  const r = d.results[0]
  console.log('住所:', r.formatted_address)
  console.log('座標:', r.geometry.location)
  console.log('精度:', r.geometry.location_type)
}
