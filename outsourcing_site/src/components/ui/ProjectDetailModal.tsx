import { Bot } from 'lucide-react'
import { useState } from 'react'
import SkillBadge from './SkillBadge'
import MatchRateBar from './MatchRateBar'
import type { Project } from '../../projects/types'
import { formatPrice } from '../../api/http'

interface Props {
  project: Project
  matchRate?: number
  role?: string | null
  onClose: () => void
  onApply?: (id: string, message: string) => void
}

export default function ProjectDetailModal({ project, matchRate, role, onClose, onApply }: Props) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit() {
    if (!message.trim() || !onApply) return
    setSubmitting(true)
    onApply(project.id, message.trim())
    setMessage('')
    setSubmitting(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-8"
        style={{ background: 'var(--color-bg-card)', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-starbucks-green)' }}>{project.title}</h2>
            {project.client_name && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>의뢰인: {project.client_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-colors"
            style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-elevated)' }}
          >
            ✕
          </button>
        </div>

        {/* AI 매칭률 */}
        {matchRate != null && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Bot className="w-4 h-4" /> AI 매칭률</span>
            </div>
            <MatchRateBar rate={matchRate} />
          </div>
        )}

        {/* 설명 */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>프로젝트 설명</h4>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>{project.description}</p>
        </div>

        {/* 기술 스택 */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>요구 기술</h4>
          <div className="flex flex-wrap gap-1.5">
            {project.skills?.map((skill) => (
              <SkillBadge key={skill} skill={skill} />
            ))}
          </div>
        </div>

        {/* 예산 */}
        {project.budget && (
          <div className="mb-6 p-4 rounded-2xl" style={{ background: 'var(--color-bg-elevated)' }}>
            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>예산</h4>
            <p className="text-xl font-bold" style={{ color: 'var(--color-starbucks-green)' }}>{formatPrice(project.budget)}</p>
          </div>
        )}

        {/* 지원 폼 */}
        {role === 'freelancer' && onApply && (
          <div className="pt-6" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>지원 메시지</h4>
            <textarea
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-colors resize-none mb-3"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              rows={4}
              placeholder="이 프로젝트에 지원하는 이유와 본인의 경험을 작성해주세요."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || submitting}
              className="w-full px-5 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40"
              style={{ background: 'var(--color-primary)' }}
            >
              {submitting ? '지원 중...' : '지원하기'}
            </button>
          </div>
        )}

        {role !== 'freelancer' && (
          <div className="pt-6 text-center" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>프리랜서 계정으로 로그인하면 지원할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
