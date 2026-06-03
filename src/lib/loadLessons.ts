import fs from 'fs'
import path from 'path'
import type { Lesson } from '@/types/lesson'

const DATA_DIR = path.join(process.cwd(), 'data')

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

function loadFile(filePath: string, defaultCity?: string, defaultPrefecture?: string): Lesson[] {
  if (!fs.existsSync(filePath)) return []
  const raw = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw) as Lesson[]
  if (!defaultCity) return data
  return data.map((l) => ({
    ...l,
    city: l.city ?? defaultCity,
    prefecture: l.prefecture ?? defaultPrefecture ?? '滋賀県',
  }))
}

export function loadLessons(): Lesson[] {
  const lessons: Lesson[] = []

  // 大津市
  const otsuPath = path.join(DATA_DIR, 'otsu_lessons_with_coords.json')
  lessons.push(...loadFile(otsuPath, '大津市'))

  // 草津市（存在すれば）
  const kusatsuPath = path.join(DATA_DIR, 'kusatsu_lessons_with_coords.json')
  lessons.push(...loadFile(kusatsuPath, '草津市'))

  // フォールバック: 旧個別JSONファイル（otsu_lessons_with_coords.json がない場合のみ）
  if (lessons.length === 0) {
    for (const file of JSON_FILES) {
      const filePath = path.join(DATA_DIR, file)
      lessons.push(...loadFile(filePath, '大津市'))
    }
  }

  return lessons
}
