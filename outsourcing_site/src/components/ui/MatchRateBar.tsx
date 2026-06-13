interface Props {
  rate: number
}

export default function MatchRateBar({ rate }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-elevated)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${rate}%`,
            background: rate >= 90 ? 'var(--color-success)' : rate >= 70 ? 'var(--color-primary)' : 'var(--color-warning)',
          }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right" style={{ color: 'var(--color-starbucks-green)' }}>{rate}%</span>
    </div>
  )
}
