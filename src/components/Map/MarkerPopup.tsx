import type { Lesson } from '@/types/lesson'

type Props = {
  lesson: Lesson
}

export default function MarkerPopup({ lesson }: Props) {
  return (
    <div className="min-w-[220px] text-sm">
      <div className="font-bold text-base mb-1">{lesson.name}</div>
      <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded mb-2">
        {lesson.category}
      </div>
      {lesson.address && (
        <div className="text-gray-600 mb-1">
          📍 {lesson.address}
        </div>
      )}
      {lesson.target_age && (
        <div className="text-gray-600 mb-1">
          👶 {lesson.target_age}
        </div>
      )}
      {lesson.phone && (
        <div className="text-gray-600 mb-1">
          📞 {lesson.phone}
        </div>
      )}
      {lesson.website && (
        <div className="mt-1">
          <a
            href={lesson.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-xs"
          >
            🌐 公式サイトを見る →
          </a>
        </div>
      )}
    </div>
  )
}
