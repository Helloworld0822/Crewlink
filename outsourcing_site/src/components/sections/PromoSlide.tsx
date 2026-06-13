import { useState, useEffect } from 'react'
import { Rocket, Users, Star, Building2 } from 'lucide-react'
import type { ElementType } from 'react'

const PROMO_STATS: { value: string; label: string; icon: ElementType }[] = [
  { value: '10,000+', label: '등록 프로젝트', icon: Rocket },
  { value: '5,000+', label: '활성 프리랜서', icon: Users },
  { value: '95%', label: '고객 만족도', icon: Star },
  { value: '1,200+', label: '기업 고객', icon: Building2 },
]

export default function PromoSlide() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_STATS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="h-full rounded-2xl overflow-hidden flex flex-col justify-between p-8" style={{ background: 'var(--color-house-green)' }}>
      <div className="relative flex-1 flex items-center justify-center min-h-[200px]">
        {PROMO_STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500"
            style={{
              opacity: i === currentSlide ? 1 : 0,
              transform: i === currentSlide ? 'translateY(0)' : 'translateY(12px)',
              pointerEvents: i === currentSlide ? 'auto' : 'none',
            }}
          >
            <div className="mb-3 flex justify-center text-white"><stat.icon className="w-12 h-12" /></div>
            <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-lg font-semibold text-white">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {PROMO_STATS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              background: i === currentSlide ? 'white' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
    </section>
  )
}
