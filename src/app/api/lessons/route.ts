import { NextResponse } from 'next/server'
import { loadLessons } from '@/lib/loadLessons'

export async function GET() {
  const lessons = loadLessons()
  return NextResponse.json(lessons)
}
