import { useState, useEffect, useCallback } from 'react'
import { Search, MapPin, Calendar, Loader2 } from 'lucide-react'
import type { UserProfile } from './types'
import { API_BASE } from '../api/apiBase'
import { readJsonResponse } from '../api/http'

const DUMMY_FREELANCERS: UserProfile[] = [
  {
    id: 'prof-1', user_id: 'u-1', bio: '5년차 프론트엔드 개발자입니다. React, Vue 기반 웹 앱 개발 전문.', avatar_url: null, location: '서울', website_url: null, github_url: null,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Figma'], hourly_rate: '50,000원/h', experience_years: 5, portfolio_items: [], is_public: true, inserted_at: '2026-01-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z',
    user: { id: 'u-1', name: '김태현', email: 'taehyun@example.com', account_type: 'freelancer' },
  },
  {
    id: 'prof-2', user_id: 'u-2', bio: '백엔드/인프라 엔지니어. Java, Spring Boot, AWS 기반 시스템 설계.', avatar_url: null, location: '서울', website_url: null, github_url: null,
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL'], hourly_rate: '60,000원/h', experience_years: 7, portfolio_items: [], is_public: true, inserted_at: '2026-01-02T00:00:00Z', updated_at: '2026-06-02T00:00:00Z',
    user: { id: 'u-2', name: '이수진', email: 'sujin@example.com', account_type: 'freelancer' },
  },
  {
    id: 'prof-3', user_id: 'u-3', bio: 'UI/UX 디자이너. 모바일/웹 서비스 디자인 경력 4년.', avatar_url: null, location: '부산', website_url: null, github_url: null,
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'], hourly_rate: '40,000원/h', experience_years: 4, portfolio_items: [], is_public: true, inserted_at: '2026-01-03T00:00:00Z', updated_at: '2026-06-03T00:00:00Z',
    user: { id: 'u-3', name: '박지은', email: 'jieun@example.com', account_type: 'freelancer' },
  },
  {
    id: 'prof-4', user_id: 'u-4', bio: '모바일 크로스플랫폼 개발자. Flutter와 React Native 모두 가능.', avatar_url: null, location: '대구', website_url: null, github_url: null,
    skills: ['Flutter', 'Dart', 'React Native', 'Firebase', 'Swift'], hourly_rate: '55,000원/h', experience_years: 3, portfolio_items: [], is_public: true, inserted_at: '2026-01-04T00:00:00Z', updated_at: '2026-06-04T00:00:00Z',
    user: { id: 'u-4', name: '최현우', email: 'hyunwoo@example.com', account_type: 'freelancer' },
  },
  {
    id: 'prof-5', user_id: 'u-5', bio: 'AI/ML 엔지니어. 자연어 처리 및 컴퓨터 비전 프로젝트 경험.', avatar_url: null, location: '서울', website_url: null, github_url: null,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'FastAPI', 'LangChain', 'OpenAI'], hourly_rate: '70,000원/h', experience_years: 6, portfolio_items: [], is_public: true, inserted_at: '2026-01-05T00:00:00Z', updated_at: '2026-06-05T00:00:00Z',
    user: { id: 'u-5', name: '정민서', email: 'minseo@example.com', account_type: 'freelancer' },
  },
  {
    id: 'prof-6', user_id: 'u-6', bio: '풀스택 개발자. Vue.js와 Node.js 기반 SaaS 서비스 개발 전문.', avatar_url: null, location: '인천', website_url: null, github_url: null,
    skills: ['Vue.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis'], hourly_rate: '45,000원/h', experience_years: 4, portfolio_items: [], is_public: true, inserted_at: '2026-01-06T00:00:00Z', updated_at: '2026-06-06T00:00:00Z',
    user: { id: 'u-6', name: '한도윤', email: 'doyun@example.com', account_type: 'freelancer' },
  },
]

function initials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

interface FreelancerListProps {
  token?: string | null
  onSelectFreelancer?: (userId: string) => void
}

export default function FreelancerList({ token, onSelectFreelancer }: FreelancerListProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [skillFilter, setSkillFilter] = useState('')

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (skillFilter.trim()) params.set('skill', skillFilter.trim())

      const res = await fetch(`${API_BASE}/api/freelancers?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const body = await readJsonResponse<{ data?: UserProfile[]; error?: string }>(res)
      if (!res.ok || !body?.data || body.data.length === 0) {
        setProfiles(DUMMY_FREELANCERS)
      } else {
        setProfiles(body.data)
      }
    } catch {
      setProfiles(DUMMY_FREELANCERS)
    } finally {
      setLoading(false)
    }
  }, [query, skillFilter, token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async profile load owns loading/result state.
    void fetchProfiles()
  }, [fetchProfiles])

  const allSkills = Array.from(new Set(profiles.flatMap((p) => p.skills ?? [])))

  return (
    <div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          className="flex-1 min-w-[200px] px-4 py-3 rounded-full text-sm outline-none transition-colors"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}
          placeholder="프리랜서 이름, 소개 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="px-4 py-3 rounded-full text-sm outline-none transition-colors"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
        >
          <option value="">모든 기술</option>
          {allSkills.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="mb-3 flex justify-center" style={{ color: 'var(--color-text-muted)' }}><Loader2 className="w-10 h-10 animate-spin" /></div>
          <p style={{ color: 'var(--color-text-muted)' }}>프리랜서 목록을 불러오는 중...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)' }}>
          <div className="mb-3 flex justify-center" style={{ color: 'var(--color-text-muted)' }}><Search className="w-10 h-10" /></div>
          <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>프리랜서를 찾을 수 없습니다</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>다른 검색어나 필터를 시도해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <FreelancerCard key={p.user_id} profile={p} onSelect={onSelectFreelancer} />
          ))}
        </div>
      )}
    </div>
  )
}

function FreelancerCard({
  profile,
  onSelect,
}: {
  profile: UserProfile
  onSelect?: (userId: string) => void
}) {
  const name = profile.user?.name
  const skills = profile.skills ?? []

  return (
    <div
      className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-light)',
        boxShadow: '0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24)',
        borderRadius: '12px',
      }}
      onClick={() => onSelect?.(profile.user_id)}
    >
      <div className="flex gap-4 items-start mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 overflow-hidden"
          style={{ background: profile.avatar_url ? 'transparent' : 'linear-gradient(135deg, var(--color-primary), var(--color-starbucks-green))' }}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={name ?? ''} className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            initials(name)
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{name ?? '이름 없음'}</div>
          {profile.location && (
            <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><MapPin className="w-3 h-3" /> {profile.location}</div>
          )}
          {profile.experience_years != null && (
            <div className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><Calendar className="w-3 h-3" /> 경력 {profile.experience_years}년</div>
          )}
        </div>

        {profile.hourly_rate && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold shrink-0" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            {profile.hourly_rate}
          </span>
        )}
      </div>

      {profile.bio && (
        <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
          {profile.bio}
        </p>
      )}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 5).map((s) => (
            <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              {s}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-xs self-center" style={{ color: 'var(--color-text-muted)' }}>+{skills.length - 5}</span>
          )}
        </div>
      )}

      {onSelect && (
        <div className="pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
          <button
            className="btn-pill w-full py-2.5 text-sm"
            style={{ background: 'var(--color-primary)', color: '#ffffff' }}
            onClick={(e) => { e.stopPropagation(); onSelect(profile.user_id) }}
          >
            프로필 보기
          </button>
        </div>
      )}
    </div>
  )
}
