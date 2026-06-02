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

export function loadLessons(): Lesson[] {
  const coordsPath = path.join(DATA_DIR, 'otsu_lessons_with_coords.json')

  // ジオコーディング済みデータがあれば優先使用
  if (fs.existsSync(coordsPath)) {
    const raw = fs.readFileSync(coordsPath, 'utf-8')
    return JSON.parse(raw) as Lesson[]
  }

  // なければ全JSONファイルを統合
  const lessons: Lesson[] = []
  for (const file of JSON_FILES) {
    const filePath = path.join(DATA_DIR, file)
    if (!fs.existsSync(filePath)) continue
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw) as Lesson[]
    lessons.push(...data)
  }
  return lessons
}
