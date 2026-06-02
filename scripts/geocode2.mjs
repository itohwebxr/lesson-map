/**
 * フォールバック教室に対して、住所を簡略化して再ジオコーディング
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const OTSU_CENTER = { lat: 35.0045, lng: 135.8686 }

// 大津市の主要エリアの既知座標
const KNOWN_AREAS = {
  '一里山': { lat: 34.9707, lng: 135.9107 },
  '瀬田': { lat: 34.9707, lng: 135.9107 },
  '堅田': { lat: 35.0900, lng: 135.8700 },
  '本堅田': { lat: 35.0900, lng: 135.8700 },
  '皇子が丘': { lat: 35.0195, lng: 135.8575 },
  '打出浜': { lat: 35.0065, lng: 135.8710 },
  '浜大津': { lat: 35.0063, lng: 135.8697 },
  '膳所': { lat: 34.9915, lng: 135.8807 },
  '馬場': { lat: 34.9915, lng: 135.8807 },
  '石山': { lat: 34.9726, lng: 135.9085 },
  '粟津': { lat: 34.9826, lng: 135.9020 },
  '南郷': { lat: 34.9526, lng: 135.9200 },
  '坂本': { lat: 35.0751, lng: 135.8448 },
  '雄琴': { lat: 35.0631, lng: 135.8628 },
  '真野': { lat: 35.1100, lng: 135.8800 },
  '下阪本': { lat: 35.0580, lng: 135.8500 },
  '青山': { lat: 34.9650, lng: 135.9200 },
  '大萱': { lat: 34.9760, lng: 135.9130 },
  '大将軍': { lat: 34.9800, lng: 135.9120 },
  '富士見': { lat: 34.9780, lng: 135.9000 },
  '仰木': { lat: 35.0550, lng: 135.8400 },
  'におの浜': { lat: 35.0150, lng: 135.8720 },
  '二本松': { lat: 35.0215, lng: 135.8540 },
  '京町': { lat: 35.0060, lng: 135.8680 },
  '春日町': { lat: 35.0040, lng: 135.8700 },
  '御陵町': { lat: 35.0040, lng: 135.8700 },
  '木下町': { lat: 35.0100, lng: 135.8740 },
  '桜野町': { lat: 35.0180, lng: 135.8620 },
  '竜が丘': { lat: 34.9850, lng: 135.8780 },
  '湖城が丘': { lat: 35.0400, lng: 135.8800 },
  '朝日が丘': { lat: 35.0500, lng: 135.8880 },
  '中庄': { lat: 35.0000, lng: 135.8900 },
  '御幸町': { lat: 34.9850, lng: 135.8950 },
  '光が丘': { lat: 34.9780, lng: 135.8820 },
  '大江': { lat: 34.9700, lng: 135.9150 },
  '和邇': { lat: 35.1500, lng: 135.9000 },
  '松山町': { lat: 35.0100, lng: 135.8620 },
  '栄町': { lat: 34.9760, lng: 135.9060 },
  '北比良': { lat: 35.2000, lng: 135.8800 },
  '上田上': { lat: 34.9300, lng: 135.9500 },
}

function findAreaCoords(address) {
  if (!address) return null
  for (const [area, coords] of Object.entries(KNOWN_AREAS)) {
    if (address.includes(area)) return coords
  }
  return null
}

function addJitter(coords) {
  return {
    lat: coords.lat + (Math.random() - 0.5) * 0.005,
    lng: coords.lng + (Math.random() - 0.5) * 0.005,
  }
}

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
  return new Promise((r) => setTimeout(r, ms))
}

// 住所から丁目レベルに簡略化
function simplifyAddress(address) {
  // 「丁目」「番地」「号」以降を削除
  const match = address.match(/^(滋賀県大津市[^\d]*(?:\d+丁目)?)/)
  if (match) return match[1]
  // 「市〇〇町」レベルまで
  const match2 = address.match(/^(滋賀県大津市[^0-9（（\s]+)/)
  if (match2) return match2[1]
  return address.split(/[（(]/)[0].trim()
}

async function main() {
  const filePath = path.join(DATA_DIR, 'otsu_lessons_with_coords.json')
  const lessons = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  // フォールバック座標（ランダムオフセット）になっているものを特定して改善
  let improved = 0

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]
    if (!lesson.address) continue

    // 既知エリア座標で上書き
    const areaCoords = findAreaCoords(lesson.address)
    if (areaCoords) {
      const jittered = addJitter(areaCoords)
      lesson.lat = jittered.lat
      lesson.lng = jittered.lng
      improved++
      process.stdout.write(`[${i + 1}] エリア座標: ${lesson.name}\n`)
      continue
    }

    // Nominatim で簡略住所を試す
    const simplified = simplifyAddress(lesson.address)
    if (simplified !== lesson.address) {
      const coords = await geocode(simplified)
      if (coords) {
        lesson.lat = coords.lat
        lesson.lng = coords.lng
        improved++
        process.stdout.write(`[${i + 1}] Nominatim再取得: ${lesson.name}\n`)
        await sleep(1100)
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2), 'utf-8')
  console.log(`\n改善: ${improved}件`)
}

main().catch(console.error)
