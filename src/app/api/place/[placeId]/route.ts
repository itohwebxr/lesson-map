import { NextResponse } from 'next/server'

export type PlaceRating = {
  rating: number | null
  user_ratings_total: number | null
}

interface PlaceDetailsResponse {
  status: string
  result?: {
    rating?: number
    user_ratings_total?: number
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params

  if (!placeId || !/^[A-Za-z0-9_-]+$/.test(placeId)) {
    return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ rating: null, user_ratings_total: null })
  }

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=rating,user_ratings_total&language=ja&key=${apiKey}`

  // fetch の next.revalidate で 24h キャッシュ（推奨方式）
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } })

  if (!res.ok) {
    return NextResponse.json({ rating: null, user_ratings_total: null })
  }

  const json = (await res.json()) as PlaceDetailsResponse

  if (json.status !== 'OK' || !json.result) {
    return NextResponse.json({ rating: null, user_ratings_total: null })
  }

  return NextResponse.json({
    rating: json.result.rating ?? null,
    user_ratings_total: json.result.user_ratings_total ?? null,
  } satisfies PlaceRating)
}
