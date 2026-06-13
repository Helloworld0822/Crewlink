import { Rocket, Users, Star, Building2 } from 'lucide-react'
import type { ElementType } from 'react'

const STATS: { value: string; label: string; icon: ElementType }[] = [
  { value: '10,000+', label: '등록 프로젝트', icon: Rocket },
  { value: '5,000+', label: '활성 프리랜서', icon: Users },
  { value: '95%', label: '고객 만족도', icon: Star },
  { value: '1,200+', label: '기업 고객', icon: Building2 },
]

export default function StatsSection() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="p-6 rounded-2xl text-center transition-all duration-200 hover:scale-105"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="mb-3 flex justify-center" style={{ color: 'var(--color-starbucks-green)' }}><stat.icon className="w-8 h-8" /></div>
          <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--color-starbucks-green)' }}>{stat.value}</div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</div>
        </div>
      ))}
    </section>
  )
}
