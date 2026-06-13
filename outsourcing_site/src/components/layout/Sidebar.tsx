import { useState } from 'react'
import { Search } from 'lucide-react'

const BUDGET_RANGES = ['전체', '100만원 이하', '100~300만원', '300~500만원', '500만원 이상']
const PROJECT_TYPES = ['전체', '웹 개발', '모바일 개발', 'AI/ML', '디자인', '기타']
const EXPERIENCE_LEVELS = ['전체', '신입', '1~3년', '3~5년', '5년 이상']

interface Props {
  skills: string[]
  skillFilter: string | null
  onSkillFilterChange: (skill: string | null) => void
}

export default function Sidebar({ skills, skillFilter, onSkillFilterChange }: Props) {
  const [budgetFilter, setBudgetFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState('전체')
  const [expFilter, setExpFilter] = useState('전체')

  return (
    <aside className="space-y-4">
      <div
        className="p-4 rounded-2xl"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-light)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <span><Search className="w-4 h-4" /></span> 검색 필터
        </h3>

        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>기술 스택</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSkillFilterChange(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: skillFilter === null ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                color: skillFilter === null ? 'var(--color-bg-card)' : 'var(--color-text-secondary)',
              }}
            >
              전체
            </button>
            {skills.slice(0, 12).map((skill) => (
              <button
                key={skill}
                onClick={() => onSkillFilterChange(skill)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: skillFilter === skill ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                  color: skillFilter === skill ? 'var(--color-bg-card)' : 'var(--color-text-secondary)',
                }}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>예산 범위</label>
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setBudgetFilter(range)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: budgetFilter === range ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                  color: budgetFilter === range ? 'var(--color-bg-card)' : 'var(--color-text-secondary)',
                }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>프로젝트 유형</label>
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: typeFilter === type ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                  color: typeFilter === type ? 'var(--color-bg-card)' : 'var(--color-text-secondary)',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>경력 수준</label>
          <div className="flex flex-wrap gap-1.5">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setExpFilter(level)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: expFilter === level ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                  color: expFilter === level ? 'var(--color-bg-card)' : 'var(--color-text-secondary)',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
