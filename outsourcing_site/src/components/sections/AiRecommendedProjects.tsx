import { Sparkles } from 'lucide-react'
import ProjectCard from '../ui/ProjectCard'
import type { Project } from '../../projects/types'

interface Props {
  projects: Project[]
  matchRates: Record<string, number>
  onApply: (id: string) => void
  role: string | null
}

export default function AiRecommendedProjects({ projects, matchRates, onApply, role }: Props) {
  if (projects.length === 0) return null

  return (
    <section className="feature-band rounded-2xl px-8 py-10 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl"><Sparkles className="w-7 h-7" /></span>
        <div>
          <h2 className="text-xl font-bold text-white m-0" style={{ letterSpacing: '-0.01em' }}>AI 추천 프로젝트</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.70)' }}>맞춤 기술 스택으로 추천된 프로젝트를 확인하세요</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            matchRate={matchRates[project.id]}
            onApply={onApply}
            role={role}
          />
        ))}
      </div>
    </section>
  )
}
