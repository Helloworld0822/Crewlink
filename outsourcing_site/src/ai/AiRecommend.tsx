import { useState, type ChangeEvent } from 'react'
import { Bot, Loader2 } from 'lucide-react'
import { API_BASE } from '../api/apiBase'
import { readJsonResponse, formatError, formatPrice } from '../api/http'

type Project = {
  id: string
  title: string
  description: string
  skills: string[]
  budget: string
  client_name: string | null
  inserted_at: string | null
}

type Recommendation = {
  project_id: string
  reason: string
  project: Project | null
}

type AiResult = {
  recommendations: Recommendation[]
  summary: string
}

export default function AiRecommend({ token }: { token: string | null }) {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<AiResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRecommend() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API_BASE}/api/ai/recommend`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt }),
      })
      const body = await readJsonResponse<AiResult & { error?: unknown }>(res)
      if (!res.ok) {
        setError(formatError((body as { error?: unknown } | null)?.error, 'AI 추천 실패'))
      } else if (body) {
        setResult(body)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-bg-card)',
          boxShadow: '0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24)',
          borderRadius: '12px',
        }}
      >
        <div
          className="px-6 py-5"
          style={{ background: 'var(--color-house-green)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-lg font-bold text-white m-0"
                style={{ letterSpacing: '-0.01em' }}
              >
                AI 외주 추천
              </h2>
              <p
                className="text-sm mt-0.5 m-0"
                style={{ color: 'rgba(255,255,255,0.70)' }}
              >
                보유 기술, 희망 예산, 원하는 작업 유형을 입력하면 적합한 프로젝트를 추천해드립니다.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-3 items-end">
            <textarea
              className="flex-1 px-4 py-3 text-sm outline-none transition-colors resize-none"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-light)',
                color: 'var(--color-text)',
                borderRadius: '8px',
                letterSpacing: '-0.01em',
              }}
              value={prompt}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              placeholder="예) React와 TypeScript를 잘 다루고, 예산은 100만원 이상이면 좋겠습니다. 프론트엔드 작업을 원해요."
              rows={3}
            />
            <button
              onClick={handleRecommend}
              disabled={loading || !prompt.trim()}
              className="btn-pill px-5 py-3 text-sm font-semibold transition-all duration-200"
              style={{
                background: 'var(--color-primary)',
                color: '#ffffff',
                letterSpacing: '-0.01em',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  분석 중...
                </span>
              ) : '추천받기'}
            </button>
          </div>

          {error && (
            <div
              className="mt-4 px-4 py-3 text-sm"
              style={{
                background: 'var(--color-error-light)',
                border: '1px solid var(--color-error)',
                borderRadius: '8px',
                color: 'var(--color-error)',
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6">
              {result.summary && (
                <div
                  className="px-4 py-3 rounded-xl text-sm mb-4"
                  style={{
                    background: 'var(--color-primary-light)',
                    border: '1px solid var(--color-primary)',
                    color: 'var(--color-text)',
                    borderRadius: '8px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {result.summary}
                </div>
              )}

              {result.recommendations.length === 0 ? (
                <p
                  className="text-sm text-center py-8"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  현재 조건에 맞는 프로젝트가 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={rec.project_id}
                      className="rounded-xl p-4 transition-all duration-200"
                      style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-light)',
                        boxShadow: '0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24)',
                        borderRadius: '12px',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'var(--color-primary)' }}
                        >
                          {i + 1}
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}
                        >
                          {rec.project?.title ?? rec.project_id}
                        </span>
                      </div>
                      {rec.project && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {rec.project.skills.map(s => (
                            <span
                              key={s}
                              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                background: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                              }}
                            >
                              {s}
                            </span>
                          ))}
                          {rec.project.budget && (
                            <span
                              className="text-xs font-semibold self-center"
                              style={{ color: 'var(--color-starbucks-green)' }}
                            >
                              {formatPrice(rec.project.budget)}
                            </span>
                          )}
                        </div>
                      )}
                      <p
                        className="text-sm leading-relaxed m-0"
                        style={{ color: 'var(--color-text-secondary)', letterSpacing: '-0.01em' }}
                      >
                        {rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}