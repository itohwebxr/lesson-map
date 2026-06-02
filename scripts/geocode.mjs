/**
 * Nominatim (OpenStreetMap) でJSON内の住所を緯度経度に変換するスクリプト
 * 実行: node scripts/geocode.mjs
 * レート制限: 1 req/sec
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')

const JSON_FILES = [
  'otsu_soccer_schools.json',
  'otsu_swimming.json',
  'otsu_dance.json',
  'otsu_gymnastics.json',
  'otsu_english.json',
  'otsu_juku.json',
  'otsu_piano.json',
  'otsu_programming.json',
]

// 大津市役所付近のフォールバック座標
const OTSU_CENTER = { lat: 35.0045, lng: 135.8686 }

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=jp`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LessonMap-MVP/1.0 (lesson-map dev)' },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data.length === 0) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const allLessons = []

  for (const file of JSON_FILES) {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')
    const lessons = JSON.parse(raw)
    allLessons.push(...lessons)
  }

  console.log(`合計 ${allLessons.length} 件の教室をジオコーディングします...`)

  let ok = 0
  let fallback = 0
  let skipped = 0

  for (let i = 0; i < allLessons.length; i++) {
    const lesson = allLessons[i]

    if (!lesson.address) {
      lesson.lat = OTSU_CENTER.lat + (Math.random() - 0.5) * 0.02
      lesson.lng = OTSU_CENTER.lng + (Math.random() - 0.5) * 0.02
      skipped++
      process.stdout.write(`[${i + 1}/${allLessons.length}] SKIP (住所なし): ${lesson.name}\n`)
      continue
    }

    // 括弧内の補足説明を除いてシンプルな住所にする
    const cleanAddress = lesson.address.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim()

    try {
      const coords = await geocode(cleanAddress)
      if (coords) {
        lesson.lat = coords.lat
        lesson.lng = coords.lng
        ok++
        process.stdout.write(`[${i + 1}/${allLessons.length}] OK: ${lesson.name}\n`)
      } else {
        lesson.lat = OTSU_CENTER.lat + (Math.random() - 0.5) * 0.02
        lesson.lng = OTSU_CENTER.lng + (Math.random() - 0.5) * 0.02
        fallback++
        process.stdout.write(`[${i + 1}/${allLessons.length}] FALLBACK: ${lesson.name} / ${cleanAddress}\n`)
      }
    } catch (e) {
      lesson.lat = OTSU_CENTER.lat + (Math.random() - 0.5) * 0.02
      lesson.lng = OTSU_CENTER.lng + (Math.random() - 0.5) * 0.02
      fallback++
      process.stdout.write(`[${i + 1}/${allLessons.length}] ERROR: ${lesson.name}\n`)
    }

    // Nominatim レート制限: 1 req/sec
    await sleep(1100)
  }

  const outPath = path.join(DATA_DIR, 'otsu_lessons_with_coords.json')
  fs.writeFileSync(outPath, JSON.stringify(allLessons, null, 2), 'utf-8')

  console.log(`\n完了: 成功=${ok}, フォールバック=${fallback}, スキップ=${skipped}`)
  console.log(`保存先: ${outPath}`)
}

main().catch(console.error)
