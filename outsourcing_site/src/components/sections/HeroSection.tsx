import { useState, type ChangeEvent } from 'react'
import { Bot } from 'lucide-react'

const TECH_TAGS = [
  'Java', 'Spring Boot', 'TypeScript', 'React', 'Python', 'Node.js',
  'Vue.js', 'MySQL', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
  'Kotlin', 'Flutter', 'React Native', 'Django', 'NestJS', 'Redis'
]

interface Props {
  onSearch: (query: string) => void
  onTagClick: (tag: string) => void
  onQueryChange: (query: string) => void
}

export default function HeroSection({ onSearch, onTagClick, onQueryChange }: Props) {
  const [query, setQuery] = useState('')

  function handleSearch() {
    if (query.trim()) onSearch(query.trim())
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    onQueryChange(value)
  }

  return (
    <section className="feature-band relative overflow-hidden rounded-2xl h-full">
      <div className="relative z-10 px-8 py-10 md:px-12 md:py-12 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight" style={{ letterSpacing: '-0.01em' }}>
          최고의 개발자와<br />프로젝트를 연결합니다
        </h1>
        <p className="text-sm md:text-base mb-6 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.70)', letterSpacing: '-0.01em' }}>
          AI 기반 추천으로 가장 적합한 프로젝트와 프리랜서를 찾아보세요.
        </p>

        <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto mb-5">
          <div className="flex-1 flex items-center gap-3 p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <div className="flex-1 flex items-center gap-3 px-4">
              <svg className="w-5 h-5 shrink-0" style={{ color: 'rgba(255,255,255,0.50)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="프로젝트, 기술 스택, 프리랜서 검색..."
                value={query}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent border-none outline-none text-white text-sm py-2.5"
                style={{ letterSpacing: '-0.01em' }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-pill px-5 py-2.5 text-sm"
              style={{ background: '#ffffff', color: '#1E3932' }}
            >
              검색
            </button>
          </div>
          <button
            className="btn-pill px-5 py-2.5 text-sm whitespace-nowrap"
            style={{ background: '#00754A', color: '#ffffff' }}
          >
            <Bot className="w-4 h-4 inline" /> AI 견적 요청
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {TECH_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-white"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
