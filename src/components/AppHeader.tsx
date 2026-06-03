'use client'

import Image from 'next/image'
import { trackEvent, GA_EVENTS } from '@/lib/gtm'

type Props = { lessonCount: number }

export default function AppHeader({ lessonCount }: Props) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="LessonMap" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-bold text-blue-600">LessonMap</span>
        <span className="text-sm text-gray-500 hidden sm:inline">
          滋賀県の習い事を探す
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-400 hidden sm:block">
          全{lessonCount}件収録
        </div>
        <a
          href="https://forms.gle/WZtdQwazezR8AMSi6"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow transition-colors"
          onClick={() => trackEvent(GA_EVENTS.CONTACT_CLICK, { source: 'header' })}
        >
          <span>✏️</span>
          <span>掲載情報の修正・掲載依頼・ご意見はこちら</span>
        </a>
      </div>
    </header>
  )
}
