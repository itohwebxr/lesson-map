/**
 * 国土地理院 Geocoding API で住所を緯度経度に変換
 * https://msearch.gsi.go.jp/address-search/AddressSearch?q=住所
 * 無料・APIキー不要・日本語住所に正確対応
 *
 * 実行: node scripts/geocode3.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')

// 住所なしのフォールバック（大津市役所）
const OTSU_CITY_HALL = { lat: 35.0045, lng: 135.8686 }

async function geocodeGSI(address) {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null
  const [lng, lat] = data[0].geometry.coordinates
  return { lat, lng }
}

// 住所から補足情報（括弧内・施設名）を除去してシンプルにする
function cleanAddress(address) {
  return address
    .replace(/（[^）]*）/g, '')   // 全角括弧内を削除
    .replace(/\([^)]*\)/g, '')    // 半角括弧内を削除
    .replace(/[　\s]+/g, ' ')     // 全角スペース統一
    .replace(/\s*[123]F$/, '')    // 末尾の階数を削除
    .replace(/\s*\d+階.*$/, '')   // 末尾の階数を削除
    .trim()
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const filePath = path.join(DATA_DIR, 'otsu_lessons_with_coords.json')
  const lessons = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  let ok = 0
  let fallback = 0
  let skipped = 0

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]

    if (!lesson.address) {
      // 住所なし → 大津市役所付近にランダム配置
      lesson.lat = OTSU_CITY_HALL.lat + (Math.random() - 0.5) * 0.02
      lesson.lng = OTSU_CITY_HALL.lng + (Math.random() - 0.5) * 0.02
      skipped++
      process.stdout.write(`[${i + 1}/${lessons.length}] SKIP: ${lesson.name}\n`)
      continue
    }

    const cleaned = cleanAddress(lesson.address)
    const coords = await geocodeGSI(cleaned)

    if (coords) {
      lesson.lat = coords.lat
      lesson.lng = coords.lng
      ok++
      process.stdout.write(`[${i + 1}/${lessons.length}] ✓ ${lesson.name}\n`)
    } else {
      // GSIでも取れない場合は住所の丁目レベルで再試行
      const shorter = cleaned.replace(/\d+-\d+(-\d+)?$/, '').trim()
      const coords2 = await geocodeGSI(shorter)
      if (coords2) {
        lesson.lat = coords2.lat
        lesson.lng = coords2.lng
        ok++
        process.stdout.write(`[${i + 1}/${lessons.length}] ✓ (丁目) ${lesson.name}\n`)
        await sleep(1000)
        continue
      }

      lesson.lat = OTSU_CITY_HALL.lat + (Math.random() - 0.5) * 0.01
      lesson.lng = OTSU_CITY_HALL.lng + (Math.random() - 0.5) * 0.01
      fallback++
      process.stdout.write(`[${i + 1}/${lessons.length}] FALLBACK: ${lesson.name} / ${cleaned}\n`)
    }

    await sleep(1000)
  }

  fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2), 'utf-8')

  console.log(`\n完了: ✓成功=${ok}, フォールバック=${fallback}, 住所なし=${skipped}`)
  console.log(`保存: ${filePath}`)
}

main().catch(console.error)
