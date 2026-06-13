export default function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="skeleton h-4 w-24 mb-4" />
      <div className="skeleton h-6 w-3/4 mb-2" />
      <div className="skeleton h-4 w-full mb-1" />
      <div className="skeleton h-4 w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-14 rounded-full" />
      </div>
      <div className="flex justify-between pt-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-9 w-20 rounded-full" />
      </div>
    </div>
  )
}
