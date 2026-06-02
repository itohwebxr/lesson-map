import type { Lesson, DataQuality } from '@/types/lesson'

/**
 * データ品質判定:
 * high   - 住所・緯度経度・曜日・時間・対象年齢がすべて揃っている
 * medium - 住所または曜日が欠けているがある程度揃っている
 * low    - 住所なし、またはスケジュール情報が全くない
 */
export function calcDataQuality(lesson: Lesson): DataQuality {
  const hasLocation = lesson.lat !== undefined && lesson.address !== null
  const hasWeekday = lesson.schedules?.some((s) => s.weekday != null)
  const hasTime = lesson.schedules?.some((s) => s.start_time != null)
  const hasAge = lesson.target_age !== null

  if (hasLocation && hasWeekday && hasTime && hasAge) return 'high'
  if (hasLocation && (hasWeekday || hasAge)) return 'medium'
  return 'low'
}

export function withDataQuality(lessons: Lesson[]): Lesson[] {
  return lessons.map((l) => ({ ...l, data_quality: calcDataQuality(l) }))
}
