import { NextResponse } from 'next/server'
import { loadLessons } from '@/lib/loadLessons'
import { withDataQuality } from '@/lib/dataQuality'

export async function GET() {
  const lessons = withDataQuality(loadLessons())
  return NextResponse.json(lessons)
}
