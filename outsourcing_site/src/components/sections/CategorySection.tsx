import { FolderOpen, Globe, Smartphone, Bot, Palette, Settings, Cloud } from 'lucide-react'
import type { ElementType } from 'react'

const CATEGORIES: { id: string; name: string; icon: ElementType; description: string }[] = [
  { id: 'web', name: '웹 개발', icon: Globe, description: '반응형 웹사이트, 웹 애플리케이션 개발' },
  { id: 'mobile', name: '모바일 개발', icon: Smartphone, description: 'iOS, Android 네이티브 및 크로스 플랫폼' },
  { id: 'ai', name: 'AI/ML', icon: Bot, description: '머신러닝, 딥러닝, AI 솔루션' },
  { id: 'design', name: 'UI/UX 디자인', icon: Palette, description: '사용자 경험 및 인터페이스 디자인' },
  { id: 'backend', name: '백엔드', icon: Settings, description: '서버, API, 데이터베이스 개발' },
  { id: 'cloud', name: '클라우드', icon: Cloud, description: 'AWS, GCP, Azure 인프라 구축' },
]

interface Props {
  onCategoryClick?: (categoryId: string) => void
}

export default function CategorySection({ onCategoryClick }: Props) {
  return (
    <section className="mb-8 px-6 py-8 rounded-2xl" style={{ background: 'var(--color-bg-elevated)' }}>
      <div className="flex items-center gap-3 mb-5">
        <FolderOpen className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
        <h2 className="text-xl font-bold m-0" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>서비스 카테고리</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick?.(category.id)}
            className="group p-5 rounded-xl text-center transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-light)',
              boxShadow: '0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24)',
              borderRadius: '12px',
            }}
          >
            <div className="mb-3 flex justify-center" style={{ color: 'var(--color-text)' }}><category.icon className="w-8 h-8" /></div>
            <div className="font-semibold mb-1 text-sm" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{category.name}</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{category.description}</div>
          </button>
        ))}
      </div>
    </section>
  )
}
