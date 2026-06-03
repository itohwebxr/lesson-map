declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

// --------------- イベント名定数 ---------------
export const GA_EVENTS = {
  CATEGORY_FILTER: 'category_filter',
  AGE_FILTER: 'age_filter',
  DAY_FILTER: 'day_filter',
  LESSON_DETAIL_VIEW: 'lesson_detail_view',
  LESSON_WEBSITE_CLICK: 'lesson_website_click',
  CONTACT_CLICK: 'contact_click',
} as const

export type GaEventName = (typeof GA_EVENTS)[keyof typeof GA_EVENTS]

// --------------- パラメータ型 ---------------
type EventParams = {
  category_filter: { category: string }
  age_filter: { age_group: string }
  day_filter: { day: string }
  lesson_detail_view: { lesson_name: string; category: string; city: string }
  lesson_website_click: { lesson_name: string; category: string; url: string }
  contact_click: { source: string }
}

// --------------- 重複送信防止 ---------------
// 同一イベント+パラメータを200ms以内に複数回送信しない
let lastSent = ''
let lastSentAt = 0

function isDuplicate(key: string): boolean {
  const now = Date.now()
  if (key === lastSent && now - lastSentAt < 200) return true
  lastSent = key
  lastSentAt = now
  return false
}

// --------------- 共通送信関数 ---------------
export function trackEvent<E extends GaEventName>(
  eventName: E,
  params: EventParams[E]
): void {
  if (process.env.NODE_ENV !== 'production') return

  const key = `${eventName}:${JSON.stringify(params)}`
  if (isDuplicate(key)) return

  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event: eventName, ...params })
}
