import { unstable_cache } from 'next/cache'
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

// Place Details を 24h キャッシュ
const fetchPlaceDetails = unstable_cache(
  async (placeId: string): Promise<PlaceRating> => {
    const key = process.env.GOOGLE_MAPS_API_KEY
    if (!key) return { rating: null, user_ratings_total: null }

    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}&fields=rating,user_ratings_total&language=ja&key=${key}`

    const res = await fetch(url)
    if (!res.ok) return { rating: null, user_ratings_total: null }

    const json = (await res.json()) as PlaceDetailsResponse
    if (json.status !== 'OK' || !json.result) {
      return { rating: null, user_ratings_total: null }
    }

    return {
      rating: json.result.rating ?? null,
      user_ratings_total: json.result.user_ratings_total ?? null,
    }
  },
  ['google-place-details'],
  { revalidate: 60 * 60 * 24 } // 24 hours
)

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params

  if (!placeId || !/^[A-Za-z0-9_-]+$/.test(placeId)) {
    return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 })
  }

  const data = await fetchPlaceDetails(placeId)
  return NextResponse.json(data)
}
