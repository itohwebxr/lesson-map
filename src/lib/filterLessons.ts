import type { Lesson, FilterState } from '@/types/lesson'

export const CATEGORIES = [
  'サッカー', 'スイミング', 'ダンス', '体操',
  '英会話', '学習塾', 'ピアノ', 'プログラミング',
]

export const AGE_OPTIONS = [
  { label: '未就園児（〜2歳）', value: 'baby' },
  { label: '幼児（3〜5歳）', value: 'preschool' },
  { label: '小学生低学年（1〜3年）', value: 'elementary_low' },
  { label: '小学生高学年（4〜6年）', value: 'elementary_high' },
  { label: '中学生', value: 'junior_high' },
]

function matchesAge(targetAge: string | null, ageValue: string): boolean {
  if (!targetAge) return true
  const t = targetAge

  switch (ageValue) {
    case 'baby':
      return /生後|ヶ月|[012]歳|未就園|ベビー|親子/.test(t)
    case 'preschool':
      return /[345]歳|年少|年中|年長|幼児|幼稚園|保育園/.test(t)
    case 'elementary_low':
      return /小学[123]|小1|小2|小3|1年|2年|3年|小学生/.test(t)
    case 'elementary_high':
      return /小学[456]|小4|小5|小6|4年|5年|6年|小学生/.test(t)
    case 'junior_high':
      return /中学|中1|中2|中3|U-1[345]/.test(t)
    default:
      return true
  }
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function matchesSchedule(
  lesson: Lesson,
  weekdays: string[],
  timeStart: string | null,
  timeEnd: string | null
): boolean {
  // スケジュール情報がない (low品質) はフィルタを通過させる
  const hasAnyWeekday = lesson.schedules?.some((s) => s.weekday != null)
  if (!hasAnyWeekday) return true

  const filterStart = timeStart ? timeToMinutes(timeStart) : null
  const filterEnd = timeEnd ? timeToMinutes(timeEnd) : null

  return lesson.schedules.some((s) => {
    // 曜日チェック
    if (weekdays.length > 0) {
      if (!s.weekday) return false
      const matched = weekdays.some((d) => s.weekday!.includes(d))
      if (!matched) return false
    }

    // 時間帯チェック
    if (filterStart !== null || filterEnd !== null) {
      if (!s.start_time) return weekdays.length === 0 // 時間なしは曜日のみフィルタ時はOK
      const schedStart = timeToMinutes(s.start_time)
      const schedEnd = s.end_time ? timeToMinutes(s.end_time) : schedStart + 60
      if (filterStart !== null && schedEnd < filterStart) return false
      if (filterEnd !== null && schedStart > filterEnd) return false
    }

    return true
  })
}

export function filterLessons(lessons: Lesson[], filter: FilterState): Lesson[] {
  return lessons.filter((lesson) => {
    // カテゴリフィルタ
    if (filter.categories.length > 0 && !filter.categories.includes(lesson.category)) {
      return false
    }

    // 対象年齢フィルタ
    if (filter.targetAge && !matchesAge(lesson.target_age, filter.targetAge)) {
      return false
    }

    // 曜日・時間フィルタ
    const hasScheduleFilter =
      filter.weekdays.length > 0 || filter.timeStart !== null || filter.timeEnd !== null
    if (hasScheduleFilter && !matchesSchedule(lesson, filter.weekdays, filter.timeStart, filter.timeEnd)) {
      return false
    }

    return true
  })
}
