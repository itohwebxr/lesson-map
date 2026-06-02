import type { DataQuality } from '@/types/lesson'

const CONFIG: Record<DataQuality, { label: string; className: string }> = {
  high:   { label: '情報充実', className: 'bg-green-100 text-green-700 border-green-200' },
  medium: { label: '情報あり', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low:    { label: '情報少',   className: 'bg-gray-100 text-gray-400 border-gray-200' },
}

export default function DataQualityBadge({ quality }: { quality: DataQuality }) {
  const { label, className } = CONFIG[quality]
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded border ${className}`}>
      {label}
    </span>
  )
}
