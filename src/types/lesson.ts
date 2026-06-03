export type DataQuality = 'high' | 'medium' | 'low'

export type Schedule = {
  weekday: string | null
  start_time: string | null
  end_time: string | null
}

export type Lesson = {
  name: string
  category: string
  city?: string
  prefecture?: string
  address: string | null
  website: string | null
  phone: string | null
  target_age: string | null
  schedules: Schedule[]
  price: string | null
  source_url: string
  organization_type: string
  lat?: number
  lng?: number
  data_quality?: DataQuality
}

export type FilterState = {
  categories: string[]
  weekdays: string[]
  timeStart: string | null
  timeEnd: string | null
  targetAge: string | null
}
