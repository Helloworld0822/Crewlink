import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import type { Session } from '../../api/types'

interface Props {
  session: Session | null
  view: string
  onViewChange: (view: string) => void
  onLoginClick: () => void
  onSignupClick: () => void
  onLogout: () => void
  onProfileClick: () => void
  colorMode: 'day' | 'night'
  onColorModeToggle: () => void
  notificationBell?: ReactNode
}

export default function Header({
  session,
  view,
  onViewChange,
  onLoginClick,
  onSignupClick,
  onLogout,
  onProfileClick,
  colorMode,
  onColorModeToggle,
  notificationBell,
}: Props) {
  const tabs = [
    { id: 'projects', label: '프로젝트' },
    { id: 'services', label: '서비스' },
    { id: 'freelancers', label: '프리랜서' },
    { id: 'ai', label: 'AI 추천' },
  ]

  return (
    <header
      className="sticky top-0 z-50 px-6 py-5 transition-all"
      style={{
        background: colorMode === 'night' ? 'rgba(10, 26, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-nav)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold" style={{ color: 'var(--color-starbucks-green)', letterSpacing: '-0.02em' }}>Crewlink</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: view === tab.id ? 'var(--color-primary)' : 'transparent',
                color: view === tab.id ? 'var(--color-bg-card)' : 'var(--color-text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onColorModeToggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {colorMode === 'day' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {notificationBell}

          {session ? (
            <>
              <button
                onClick={onProfileClick}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--color-starbucks-green)' }}>
                  {session.user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline">{session.user.name}</span>
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                로그인
              </button>
              <button
                onClick={onSignupClick}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{ background: 'var(--color-text)', color: 'var(--color-bg-card)' }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
