#!/usr/bin/env node
/**
 * Google Places Text Search API を使って各教室の Place ID を収集する。
 *
 * Usage:
 *   GOOGLE_MAPS_API_KEY=<key> npx tsx scripts/enrich-google-place-id.ts [--file data/otsu_lessons_with_coords.json]
 *
 * - すでに google_place_id が設定済みのレコードはスキップ
 * - 取得できない場合は null を設定
 * - API レート制限を避けるため 200ms/件 のウェイトを挟む
 */

import fs from 'fs'
import path from 'path'

// ---- 型定義 ----
interface Lesson {
  name: string
  category: string
  address: string | null
  city?: string
  google_place_id?: string | null
  [key: string]: unknown
}

interface PlaceCandidate {
  place_id: string
  name: string
  formatted_address: string
}

interface TextSearchResponse {
  status: string
  results: PlaceCandidate[]
  error_message?: string
}

// ---- 引数処理 ----
const args = process.argv.slice(2)
const fileFlag = args.indexOf('--file')
const targetFile = fileFlag !== -1
  ? args[fileFlag + 1]
  : 'data/otsu_lessons_with_coords.json'

const filePath = path.resolve(process.cwd(), targetFile)

const API_KEY = process.env.GOOGLE_MAPS_API_KEY
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY environment variable is required')
  process.exit(1)
}

// ---- 類似度チェック ----
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s　・]/g, '')
}

function isLikelyMatch(lesson: Lesson, candidate: PlaceCandidate): boolean {
  const lessonName = normalize(lesson.name)
  const candidateName = normalize(candidate.name)

  // 教室名の主要語（最初の4文字以上）が含まれているか
  const lessonPrefix = lessonName.slice(0, Math.max(4, Math.floor(lessonName.length * 0.5)))
  if (!candidateName.includes(lessonPrefix) && !lessonName.includes(normalize(candidate.name).slice(0, 4))) {
    return false
  }

  // 住所に市区町村が一致しているか
  const addr = candidate.formatted_address
  const city = lesson.city ?? (lesson.address?.match(/大津市|草津市/)?.[0] ?? '')
  if (city && !addr.includes(city)) {
    return false
  }

  return true
}

// ---- Places Text Search ----
async function searchPlaceId(lesson: Lesson): Promise<string | null> {
  if (!lesson.address) return null

  const query = encodeURIComponent(`${lesson.name} ${lesson.address}`)
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=ja&key=${API_KEY}`

  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`  HTTP ${res.status} for ${lesson.name}`)
    return null
  }

  const json = (await res.json()) as TextSearchResponse

  if (json.status === 'ZERO_RESULTS') return null

  if (json.status !== 'OK') {
    console.warn(`  API status ${json.status}: ${json.error_message ?? ''}`)
    return null
  }

  const top = json.results[0]
  if (!top) return null

  if (!isLikelyMatch(lesson, top)) {
    console.log(`  ✗ 不一致スキップ: "${lesson.name}" → "${top.name}" (${top.formatted_address})`)
    return null
  }

  console.log(`  ✓ ${lesson.name} → ${top.place_id} (${top.name})`)
  return top.place_id
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---- メイン ----
async function main() {
  const lessons: Lesson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  const toProcess = lessons.filter((l) => l.google_place_id === undefined)
  console.log(`対象: ${toProcess.length}件 / 全${lessons.length}件 (スキップ: ${lessons.length - toProcess.length}件)`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]
    if (lesson.google_place_id !== undefined) continue

    process.stdout.write(`[${i + 1}/${lessons.length}] ${lesson.name} ... `)

    try {
      const placeId = await searchPlaceId(lesson)
      lesson.google_place_id = placeId
      if (placeId) updated++
      else {
        failed++
        process.stdout.write('\n')
      }
    } catch (err) {
      console.error(`\n  Error: ${err}`)
      lesson.google_place_id = null
      failed++
    }

    // 変更を都度書き込み（中断しても途中まで保存）
    fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2), 'utf-8')

    await sleep(200)
  }

  console.log(`\n完了: 取得成功 ${updated}件, 未取得 ${failed}件`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
