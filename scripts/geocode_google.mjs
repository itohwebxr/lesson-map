/**
 * Google Maps Geocoding API で住所を緯度経度に変換
 * 実行前に環境変数を設定: export GOOGLE_MAPS_API_KEY="AIzaSy..."
 * 実行: node scripts/geocode_google.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')

const API_KEY = process.env.GOOGLE_MAPS_API_KEY
if (!API_KEY) {
  console.error('エラー: GOOGLE_MAPS_API_KEY が設定されていません')
  console.error('実行前に: export GOOGLE_MAPS_API_KEY="AIzaSy..."')
  process.exit(1)
}

const OTSU_CITY_HALL = { lat: 35.0045, lng: 135.8686 }

async function geocodeGoogle(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=ja&region=jp&key=${API_KEY}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 'OK' || data.results.length === 0) return null
  const { lat, lng } = data.results[0].geometry.location
  // 精度タイプも返す（ROOFTOP=最高精度, RANGE_INTERPOLATED=補間, GEOMETRIC_CENTER=代表点, APPROXIMATE=概算）
  const accuracy = data.results[0].geometry.location_type
  return { lat, lng, accuracy }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const filePath = path.join(DATA_DIR, 'otsu_lessons_with_coords.json')
  const lessons = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  const stats = { ROOFTOP: 0, RANGE_INTERPOLATED: 0, GEOMETRIC_CENTER: 0, APPROXIMATE: 0, skip: 0, error: 0 }

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]

    if (!lesson.address) {
      lesson.lat = OTSU_CITY_HALL.lat + (Math.random() - 0.5) * 0.02
      lesson.lng = OTSU_CITY_HALL.lng + (Math.random() - 0.5) * 0.02
      stats.skip++
      process.stdout.write(`[${i + 1}/${lessons.length}] SKIP (住所なし): ${lesson.name}\n`)
      continue
    }

    // 括弧内の補足情報を除去
    const cleaned = lesson.address
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .trim()

    const result = await geocodeGoogle(cleaned)

    if (result) {
      lesson.lat = result.lat
      lesson.lng = result.lng
      lesson.geocode_accuracy = result.accuracy
      stats[result.accuracy] = (stats[result.accuracy] || 0) + 1
      process.stdout.write(`[${i + 1}/${lessons.length}] ✓ [${result.accuracy}] ${lesson.name}\n`)
    } else {
      lesson.lat = OTSU_CITY_HALL.lat + (Math.random() - 0.5) * 0.01
      lesson.lng = OTSU_CITY_HALL.lng + (Math.random() - 0.5) * 0.01
      lesson.geocode_accuracy = 'FAILED'
      stats.error++
      process.stdout.write(`[${i + 1}/${lessons.length}] ✗ FAILED: ${lesson.name}\n`)
    }

    // Google Maps API レート制限に配慮（無料枠: 50req/sec）
    await sleep(200)
  }

  fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2), 'utf-8')

  console.log('\n=== 完了 ===')
  console.log(`ROOFTOP（建物レベル）   : ${stats.ROOFTOP}件`)
  console.log(`RANGE_INTERPOLATED（補間）: ${stats.RANGE_INTERPOLATED}件`)
  console.log(`GEOMETRIC_CENTER（代表点）: ${stats.GEOMETRIC_CENTER}件`)
  console.log(`APPROXIMATE（概算）      : ${stats.APPROXIMATE}件`)
  console.log(`住所なし（スキップ）      : ${stats.skip}件`)
  console.log(`失敗                     : ${stats.error}件`)
  console.log(`保存先: ${filePath}`)
}

main().catch(console.error)
