import { Bot } from 'lucide-react'
import SkillBadge from './SkillBadge'
import MatchRateBar from './MatchRateBar'
import type { Project } from '../../projects/types'
import { formatPrice } from '../../api/http'

interface Props {
  project: Project
  matchRate?: number
  onApply?: (id: string) => void
  onClick?: () => void
  role?: string | null
}

export default function ProjectCard({ project, matchRate, onApply, onClick, role }: Props) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-card)',
      }}
      onClick={onClick}
    >
      {matchRate != null && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Bot className="w-4 h-4" /> AI 매칭률</span>
          </div>
          <MatchRateBar rate={matchRate} />
        </div>
      )}

      <h3 className="text-lg font-bold mb-2 line-clamp-1" style={{ color: 'var(--color-starbucks-green)' }}>{project.title}</h3>
      <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{project.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.skills?.slice(0, 4).map((skill) => (
          <SkillBadge key={skill} skill={skill} />
        ))}
        {project.skills && project.skills.length > 4 && (
          <span className="text-xs self-center" style={{ color: 'var(--color-text-muted)' }}>+{project.skills.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
        <div className="flex items-center gap-4 text-sm">
          {project.budget && (
            <span className="font-semibold" style={{ color: 'var(--color-starbucks-green)' }}>{formatPrice(project.budget)}</span>
          )}
          {project.client_name && (
            <span style={{ color: 'var(--color-text-muted)' }}>{project.client_name}</span>
          )}
        </div>
        {role === 'freelancer' && onApply && (
          <button
            onClick={() => onApply(project.id)}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200"
            style={{ background: 'var(--color-primary)' }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            지원하기
          </button>
        )}
      </div>
    </div>
  )
}
