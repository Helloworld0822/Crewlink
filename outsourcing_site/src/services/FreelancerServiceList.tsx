import { useState, useEffect, useMemo, type ChangeEvent } from 'react'
import { Users } from 'lucide-react'
import { API_BASE } from '../api/apiBase'
import { readJsonResponse, formatPrice } from '../api/http'
import type { FreelancerService } from './types'

const DUMMY_SERVICES: FreelancerService[] = [
  {
    id: 'svc-1', freelancer_id: 'fl-1', title: 'React/Next.js 웹앱 개발', description: '반응형 웹 애플리케이션을 React와 Next.js로 개발합니다. SSR/SSG, 상태관리, API 연동까지 원스톱으로 처리합니다.',
    category: 'development', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'], price: '3000000', delivery_days: 14, thumbnail_url: null, is_active: true, inserted_at: '2026-06-01T00:00:00Z',
    freelancer: { id: 'fl-1', name: '김태현', email: 'taehyun@example.com' },
  },
  {
    id: 'svc-2', freelancer_id: 'fl-2', title: '스프링부트 백엔드 API 개발', description: 'Java/Spring Boot 기반 REST API 서버를 설계하고 개발합니다. JWT 인증, DB 설계, 배포 지원.',
    category: 'development', skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'], price: '4000000', delivery_days: 21, thumbnail_url: null, is_active: true, inserted_at: '2026-06-02T00:00:00Z',
    freelancer: { id: 'fl-2', name: '이수진', email: 'sujin@example.com' },
  },
  {
    id: 'svc-3', freelancer_id: 'fl-3', title: 'Figma UI/UX 디자인', description: '모바일/웹 앱의 UI/UX를 Figma로 설계합니다. 프로토타입, 디자인 시스템, 컴포넌트 라이브러리 제공.',
    category: 'design', skills: ['Figma', 'Adobe XD', 'Sketch'], price: '2000000', delivery_days: 10, thumbnail_url: null, is_active: true, inserted_at: '2026-06-03T00:00:00Z',
    freelancer: { id: 'fl-3', name: '박지은', email: 'jieun@example.com' },
  },
  {
    id: 'svc-4', freelancer_id: 'fl-4', title: '유튜브 영상 편집', description: '유튜브/릴스/틱톡용 숏폼 및 롱폼 영상 편집. 자막, 효과, 썸네일 포함.',
    category: 'video', skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'], price: '500000', delivery_days: 5, thumbnail_url: null, is_active: true, inserted_at: '2026-06-04T00:00:00Z',
    freelancer: { id: 'fl-4', name: '최현우', email: 'hyunwoo@example.com' },
  },
  {
    id: 'svc-5', freelancer_id: 'fl-5', title: '영어-한국어 번역', description: '비즈니스 문서, 기술 문서, 마케팅 카피의 영한/한영 번역. 전문 분야별 번역 가능.',
    category: 'translation', skills: ['영어', '한국어', '비즈니스 문서'], price: '300000', delivery_days: 3, thumbnail_url: null, is_active: true, inserted_at: '2026-06-05T00:00:00Z',
    freelancer: { id: 'fl-5', name: '김수아', email: 'sua@example.com' },
  },
  {
    id: 'svc-6', freelancer_id: 'fl-6', title: 'Python 자동화 스크립트', description: '반복 작업 자동화, 웹 크롤링, 데이터 파이프라인 등 Python 기반 자동화 스크립트를 개발합니다.',
    category: 'development', skills: ['Python', 'Selenium', 'Pandas', 'BeautifulSoup'], price: '1500000', delivery_days: 7, thumbnail_url: null, is_active: true, inserted_at: '2026-06-06T00:00:00Z',
    freelancer: { id: 'fl-6', name: '정민서', email: 'minseo@example.com' },
  },
]

const CATEGORY_MAP: Record<string, string> = {
  web: 'development',
  mobile: 'development',
  ai: 'development',
  design: 'design',
  backend: 'development',
  cloud: 'development',
}

const CATEGORY_LABELS: Record<string, string> = {
  development: '개발',
  design: '디자인',
  writing: '글쓰기/콘텐츠',
  marketing: '마케팅',
  translation: '번역',
  video: '영상/편집',
  other: '기타',
}

export default function FreelancerServiceList({
  token,
  refreshKey,
  onOrder,
  initialCategory,
}: {
  token: string | null
  refreshKey: number
  onOrder: (service: FreelancerService) => void
  initialCategory?: string | null
}) {
  const [services, setServices] = useState<FreelancerService[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const mappedInitialCategory = useMemo(
    () => (initialCategory ? CATEGORY_MAP[initialCategory] ?? initialCategory : null),
    [initialCategory],
  )

  useEffect(() => {
    if (mappedInitialCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync category from route-selected section.
      setCategory((prev) => (prev === mappedInitialCategory ? prev : mappedInitialCategory))
    }
  }, [mappedInitialCategory])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query.trim()) params.set('q', query.trim())
        if (category) params.set('category', category)
        const qs = params.toString() ? `?${params.toString()}` : ''
        const res = await fetch(`${API_BASE}/api/freelancer/services${qs}`)
        const body = await readJsonResponse<{ data: FreelancerService[] } & { error?: unknown }>(res)
        if (cancelled) return
        if (!res.ok || !body?.data || body.data.length === 0) {
          const fallback = category
            ? DUMMY_SERVICES.filter(s => s.category === category)
            : DUMMY_SERVICES
          setServices(fallback)
        } else {
          setServices(body.data)
        }
      } catch {
        if (!cancelled) setServices(DUMMY_SERVICES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [query, category, refreshKey])

  return (
    <div>
      <div className="mb-8 px-8 py-10 rounded-2xl text-center" style={{ background: 'var(--color-house-green)' }}>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 justify-center" style={{ letterSpacing: '-0.01em' }}><Users className="w-6 h-6" /> 프리랜서 서비스</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.70)' }}>전문 프리랜서가 제공하는 고품질 서비스를 찾아보세요</p>
      </div>

      <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-.82 4.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06l-3.04-3.04Z"/></svg>
          <input
            className="w-full pl-9 pr-4 py-3 rounded-full text-sm outline-none transition-colors"
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}
            placeholder="서비스 검색..."
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {['전체', ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))].map((item) => {
          const value = item === '전체' ? null : (item as { value: string; label: string }).value
          const label = item === '전체' ? '전체' : (item as { value: string; label: string }).label
          const active = (value === null && category === null) || value === category
          return (
            <button
              key={label}
              onClick={() => setCategory(value)}
              className="btn-pill text-xs"
              style={{
                background: active ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                color: active ? '#ffffff' : 'var(--color-text-secondary)',
                border: active ? 'none' : '1px solid var(--color-border-light)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {loading && (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>불러오는 중...</p>
      )}

      {!loading && services.length === 0 && (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>등록된 서비스가 없습니다.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-light)',
              boxShadow: '0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24)',
              borderRadius: '12px',
            }}
          >
            <div className="w-full h-40 flex items-center justify-center text-sm" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
              {CATEGORY_LABELS[s.category] ?? s.category}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-starbucks-green)', letterSpacing: '-0.01em' }}>{s.title}</h3>
              <span className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>by {s.freelancer?.name ?? '프리랜서'}</span>
              <p className="text-sm leading-relaxed mb-3 flex-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                {s.description.length > 100 ? `${s.description.slice(0, 100)}...` : s.description}
              </p>

              <div className="flex gap-1.5 flex-wrap mb-4">
                {s.skills.slice(0, 4).map((sk) => (
                  <span key={sk} className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    {sk}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                <div>
                  <span className="font-bold text-lg block" style={{ color: 'var(--color-starbucks-green)' }}>{formatPrice(s.price)}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.delivery_days}일 이내</span>
                </div>
                {token ? (
                  <button
                    className="btn-pill px-4 py-2 text-sm"
                    style={{ background: 'var(--color-primary)', color: '#ffffff' }}
                    onClick={() => onOrder(s)}
                  >
                    주문
                  </button>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>로그인 필요</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
