/**
 * 習い事教室データ収集スクリプト
 *
 * 使い方:
 *   node scripts/collect-lessons.mjs --city 草津市 --prefecture 滋賀県
 *   node scripts/collect-lessons.mjs --city 大津市 --prefecture 滋賀県 --categories サッカー,バレエ
 *
 * 出力: data/<prefecture>_<city>_lessons.json（新規） または既存ファイルへのマージ
 *
 * 前提: GOOGLE_MAPS_API_KEY 環境変数が設定されていること（住所検証に使用）
 *
 * 収集ルール: docs/data-collection-rules.md を参照
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const RULES_DOC = path.join(__dirname, '..', 'docs', 'data-collection-rules.md')

// --- CLI引数パース ---
function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { city: null, prefecture: '滋賀県', categories: null, output: null, dryRun: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city') opts.city = args[++i]
    else if (args[i] === '--prefecture') opts.prefecture = args[++i]
    else if (args[i] === '--categories') opts.categories = args[++i].split(',')
    else if (args[i] === '--output') opts.output = args[++i]
    else if (args[i] === '--dry-run') opts.dryRun = true
  }
  return opts
}

// --- カテゴリ定義 ---
const ALL_CATEGORIES = [
  'サッカー', 'スイミング', 'ピアノ', '英会話', 'ダンス', 'バレエ',
  '体操', '新体操', 'チアダンス', '武道', 'テニス', 'バスケットボール',
  '野球', '習字', 'そろばん', '学習塾', 'プログラミング', '幼児教室',
]

// --- 住所検証 ---
function hasStreetNumber(address) {
  if (!address) return false
  return /\d/.test(address)
}

// --- Google Places Geocoding ---
const API_KEY = process.env.GOOGLE_MAPS_API_KEY

async function geocodeAddress(address) {
  if (!API_KEY) return null
  if (!hasStreetNumber(address)) return null  // 番地なし住所はスキップ

  const cleaned = address.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim()
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleaned)}&language=ja&region=jp&key=${API_KEY}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'OK' || !data.results.length) return null
    const r = data.results[0]
    return {
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      geocode_accuracy: r.geometry.location_type,
      verified_address: r.formatted_address.replace('日本、', '').replace(/^〒\d{3}-\d{4}\s*/, ''),
    }
  } catch {
    return null
  }
}

// --- 施設名から住所を取得（Places APIを使用）---
async function getFacilityAddress(facilityName, city) {
  if (!API_KEY) return null
  const query = facilityName.includes(city) ? facilityName : `${city} ${facilityName}`
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&language=ja&region=jp&key=${API_KEY}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'OK' || !data.results.length) return null
    const r = data.results[0]
    const addr = r.formatted_address.replace('日本、', '').replace(/^〒\d{3}-\d{4}\s*/, '')
    return {
      address: addr,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      geocode_accuracy: r.geometry.location_type,
    }
  } catch {
    return null
  }
}

// --- 重複チェック ---
function isDuplicate(name, existingLessons) {
  return existingLessons.some(l => l.name === name)
}

// --- レコード正規化 ---
function normalizeLesson(raw, city, prefecture) {
  const addr = raw.address || ''

  return {
    name: raw.name,
    category: raw.category,
    address: addr || null,
    website: raw.website || null,
    phone: raw.phone || null,
    target_age: raw.target_age || null,
    schedules: raw.schedules || null,
    lesson_days: raw.lesson_days || null,
    lesson_days_confidence: raw.lesson_days_confidence || null,
    lesson_times: raw.lesson_times || null,
    lesson_times_confidence: raw.lesson_times_confidence || null,
    price: raw.price || null,
    monthly_fee: raw.monthly_fee || null,
    monthly_fee_confidence: raw.monthly_fee_confidence || null,
    target_age_confidence: raw.target_age_confidence || null,
    data_quality: raw.data_quality || null,
    data_sources: raw.data_sources || ['manual'],
    source_url: raw.source_url || raw.website || null,
    organization_type: raw.organization_type || null,
    lat: hasStreetNumber(addr) ? (raw.lat || null) : null,
    lng: hasStreetNumber(addr) ? (raw.lng || null) : null,
    geocode_accuracy: hasStreetNumber(addr) ? (raw.geocode_accuracy || null) : null,
    last_verified_at: raw.last_verified_at || new Date().toISOString().slice(0, 10),
  }
}

// --- メイン処理 ---
async function main() {
  const opts = parseArgs()

  if (!opts.city) {
    console.error('エラー: --city オプションが必要です')
    console.error('例: node scripts/collect-lessons.mjs --city 草津市 --prefecture 滋賀県')
    process.exit(1)
  }

  const categories = opts.categories || ALL_CATEGORIES
  const outputFile = opts.output
    || path.join(DATA_DIR, `${opts.prefecture}_${opts.city}_lessons.json`)

  // 既存データ読み込み（マージ用）
  let existingLessons = []
  if (fs.existsSync(outputFile)) {
    existingLessons = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))
    console.log(`既存データ: ${existingLessons.length}件 (${outputFile})`)
  }

  console.log(`\n対象: ${opts.prefecture}${opts.city}`)
  console.log(`カテゴリ: ${categories.join(', ')}`)
  console.log(`収集ルール: ${RULES_DOC}`)
  console.log()

  // 収集プロセスの案内
  console.log('=== 収集手順 ===')
  console.log()
  console.log('このスクリプトは収集フレームワークを提供します。')
  console.log('Claude Code を使って以下の手順でデータを収集してください:')
  console.log()
  console.log('【ステップ1】 公式サイト・ウェブ検索で教室を発掘')
  for (const cat of categories) {
    console.log(`  - "${opts.city} ${cat}教室" で検索`)
  }
  console.log()
  console.log('【ステップ2】 発掘した教室を以下のJSON形式でリストアップ')
  console.log(JSON.stringify([{
    name: '教室名',
    category: 'カテゴリ',
    address: `${opts.prefecture}${opts.city}○○（番地まで記載）`,
    website: 'https://...',
    phone: '0XX-XXX-XXXX',
    target_age: '3歳〜小学6年生',
    lesson_days: ['月', '水'],
    lesson_times: ['17:00-18:00'],
    monthly_fee: 5500,
    data_sources: ['official_site'],
  }], null, 2))
  console.log()
  console.log('【ステップ3】 このスクリプトで検証・マージ')
  console.log(`  node scripts/collect-lessons.mjs --city ${opts.city} --input /tmp/new_lessons.json`)
  console.log()

  // --input オプションがあれば実際のマージ処理
  const inputIdx = process.argv.indexOf('--input')
  if (inputIdx === -1) {
    console.log('--input オプションを指定すると新規データの検証・マージを実行します。')
    return
  }

  const inputFile = process.argv[inputIdx + 1]
  if (!fs.existsSync(inputFile)) {
    console.error(`入力ファイルが見つかりません: ${inputFile}`)
    process.exit(1)
  }

  const newRaw = JSON.parse(fs.readFileSync(inputFile, 'utf-8'))
  console.log(`\n入力データ: ${newRaw.length}件`)

  const sleep = ms => new Promise(r => setTimeout(r, ms))
  const results = { added: [], skipped_dup: [], skipped_vague: [], geocoded: 0 }

  for (const raw of newRaw) {
    // 重複チェック
    if (isDuplicate(raw.name, existingLessons)) {
      results.skipped_dup.push(raw.name)
      console.log(`SKIP (重複): ${raw.name}`)
      continue
    }

    const lesson = normalizeLesson(raw, opts.city, opts.prefecture)

    // 住所が曖昧な場合に施設名で検索
    const facilityMatch = (lesson.address || '').match(/[（(]([^）)]+)[）)]/)
    if (facilityMatch && !hasStreetNumber(lesson.address)) {
      const facility = facilityMatch[1]
      console.log(`施設名で住所検索: ${facility}`)
      const geo = await getFacilityAddress(facility, opts.city)
      if (geo) {
        lesson.address = geo.address
        lesson.lat = geo.lat
        lesson.lng = geo.lng
        lesson.geocode_accuracy = geo.geocode_accuracy
        results.geocoded++
        console.log(`  → ${geo.address}`)
      }
      await sleep(200)
    }

    // 番地あり住所でジオコーディング
    if (hasStreetNumber(lesson.address) && !lesson.lat && API_KEY) {
      const geo = await geocodeAddress(lesson.address)
      if (geo) {
        lesson.lat = geo.lat
        lesson.lng = geo.lng
        lesson.geocode_accuracy = geo.geocode_accuracy
        results.geocoded++
      }
      await sleep(200)
    }

    if (!opts.dryRun) existingLessons.push(lesson)
    results.added.push(lesson.name)
    console.log(`ADD: ${lesson.name} (${lesson.address || '住所なし'})`)
  }

  console.log('\n=== 結果 ===')
  console.log(`追加: ${results.added.length}件`)
  console.log(`重複スキップ: ${results.skipped_dup.length}件`)
  console.log(`ジオコーディング成功: ${results.geocoded}件`)

  if (!opts.dryRun) {
    fs.writeFileSync(outputFile, JSON.stringify(existingLessons, null, 2), 'utf-8')
    console.log(`\n保存先: ${outputFile} (計${existingLessons.length}件)`)
  } else {
    console.log('\n--dry-run モード: ファイルへの書き込みはスキップしました')
  }
}

main().catch(console.error)
