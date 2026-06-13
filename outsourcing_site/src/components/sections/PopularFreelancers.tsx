import SkillBadge from '../ui/SkillBadge'

interface Freelancer {
  id: string
  name: string
  avatar_url?: string | null
  skills: string[]
  rating?: number
  completed_projects?: number
}

interface Props {
  freelancers: Freelancer[]
}

export default function PopularFreelancers({ freelancers }: Props) {
  if (freelancers.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xl">🏆</span>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>인기 프리랜서</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {freelancers.map((freelancer) => (
          <div
            key={freelancer.id}
            className="p-5 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                style={{ background: 'var(--color-starbucks-green)' }}
              >
                {freelancer.avatar_url ? (
                  <img src={freelancer.avatar_url} alt={freelancer.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  freelancer.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate" style={{ color: 'var(--color-text)' }}>{freelancer.name}</div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {freelancer.rating != null && (
                    <span className="flex items-center gap-1">
                      <span style={{ color: 'var(--color-warning)' }}>★</span>
                      {freelancer.rating.toFixed(1)}
                    </span>
                  )}
                  {freelancer.completed_projects != null && (
                    <span>{freelancer.completed_projects}개 완료</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {freelancer.skills.slice(0, 3).map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
              {freelancer.skills.length > 3 && (
                <span className="text-xs self-center" style={{ color: 'var(--color-text-muted)' }}>+{freelancer.skills.length - 3}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
