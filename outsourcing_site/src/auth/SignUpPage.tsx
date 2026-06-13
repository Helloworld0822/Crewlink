import { useState, type ChangeEvent } from 'react'
import { Mail } from 'lucide-react'
import { API_BASE } from '../api/apiBase'
import { readJsonResponse, formatHttpError } from '../api/http'

const INTEREST_OPTIONS = [
  '웹 개발',
  '모바일 개발',
  '디자인',
  '마케팅',
  '데이터/AI',
  '게임 개발',
  '영상/음악',
  '번역/문서',
  '운영/CS',
  '기타',
]

interface Props {
  onBack: () => void
  onSignupComplete?: (email: string) => void
}

export default function SignUpPage({ onBack, onSignupComplete }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState<'client' | 'freelancer'>('client')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('')
  const [interests, setInterests] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  function validate() {
    if (!name.trim()) return '이름을 입력해주세요.'
    if (!email.includes('@')) return '유효한 이메일을 입력해주세요.'
    if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.'
    if (!/[A-Za-z]/.test(password)) return '비밀번호에 영문이 포함되어야 합니다.'
    if (!/[0-9]/.test(password)) return '비밀번호에 숫자가 포함되어야 합니다.'
    if (password !== confirm) return '비밀번호와 확인이 일치하지 않습니다.'
    return null
  }

  async function submitSignUp() {
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          account_type: accountType,
          email,
          password,
          birth_date: birthDate || null,
          gender: gender || null,
          interests: interests.length > 0 ? interests : [],
        }),
      })
      const body = await readJsonResponse<{ error?: string; message?: string; email?: string }>(res)
      if (!res.ok) {
        const retryAfter = res.headers.get('retry-after')
        setError(formatHttpError(res.status, retryAfter, body?.error))
      } else {
        setSignupComplete(true)
        onSignupComplete?.(email)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function resendVerification() {
    setResendLoading(true)
    setResendMessage(null)
    try {
      const res = await fetch(`${API_BASE}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const body = await readJsonResponse<{ message?: string }>(res)
      if (!res.ok) {
        const retryAfter = res.headers.get('retry-after')
        setResendMessage(formatHttpError(res.status, retryAfter, body?.message))
      } else {
        setResendMessage(body?.message || '인증 메일이 재발송되었습니다.')
      }
    } catch {
      setResendMessage('메일 재발송에 실패했습니다.')
    } finally {
      setResendLoading(false)
    }
  }

  if (signupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full mx-4 p-8 rounded-2xl text-center" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)' }}>
          <div className="mb-4 flex justify-center" style={{ color: 'var(--color-text)' }}><Mail className="w-12 h-12" /></div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>이메일 인증이 필요합니다</h2>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text)' }}>{email}</strong>로 인증 메일을 발송했습니다.
          </p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            메일함에서 인증 링크를 클릭하여 회원가입을 완료해주세요.
          </p>
          <p className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
            메일이 오지 않았나요? 스팸함을 확인하거나 아래 버튼을 눌러 재발송하세요.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={resendVerification}
              disabled={resendLoading}
              className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {resendLoading ? '발송 중...' : '인증 메일 재발송'}
            </button>
            {resendMessage && (
              <p className="text-xs" style={{ color: resendMessage.includes('발송') ? 'var(--color-success)' : 'var(--color-error)' }}>
                {resendMessage}
              </p>
            )}
            <button onClick={onBack} className="text-sm transition-colors mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              로그인 페이지로
            </button>
          </div>
        </div>
      </div>
    )
  }

  const inputStyle = { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }
  const labelStyle = { color: 'var(--color-text-secondary)' }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <header className="px-6 py-4" style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--color-starbucks-green)' }}>O</div>
          <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Crewlink</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-lg w-full">
          <div className="rounded-2xl p-8" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>회원가입</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>새 계정을 만드세요</p>
              </div>
              <button onClick={onBack} className="text-sm transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                ← 돌아가기
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>이름</label>
                <input
                  className="w-full px-4 py-3 rounded-full text-sm outline-none transition-colors"
                  style={inputStyle}
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>회원 유형</label>
                <select
                  className="w-full px-4 py-3 rounded-full text-sm outline-none transition-colors"
                  style={inputStyle}
                  value={accountType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setAccountType(e.target.value === 'freelancer' ? 'freelancer' : 'client')}
                >
                  <option value="client">클라이언트</option>
                  <option value="freelancer">프리랜서</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>이메일</label>
              <input
                className="w-full px-4 py-3 rounded-full text-sm outline-none transition-colors"
                style={inputStyle}
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>비밀번호</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 rounded-full text-sm outline-none transition-colors pr-14"
                    style={inputStyle}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8자 이상, 영문+숫자"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {showPassword ? '숨기기' : '보기'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>비밀번호 확인</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 rounded-full text-sm outline-none transition-colors pr-14"
                    style={inputStyle}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {showConfirm ? '숨기기' : '보기'}
                  </button>
                </div>
              </div>
            </div>

            <div className="my-5" style={{ borderTop: '1px solid var(--color-border-light)' }} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>생년월일</label>
                <input
                  className="w-full px-4 py-3 rounded-full text-sm outline-none transition-colors"
                  style={inputStyle}
                  type="date"
                  value={birthDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>성별</label>
                <div className="flex gap-2">
                  {[
                    { value: 'male' as const, label: '남자' },
                    { value: 'female' as const, label: '여자' },
                    { value: 'other' as const, label: '선택 안 함' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(gender === option.value ? '' : option.value)}
                      className="flex-1 py-2.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: gender === option.value ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                        border: `1px solid ${gender === option.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        color: gender === option.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>관심 분야</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: interests.includes(interest) ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                      border: `1px solid ${interests.includes(interest) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      color: interests.includes(interest) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {interests.includes(interest) ? '✓ ' : ''}{interest}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-line" style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
              >
                취소
              </button>
              <button
                onClick={submitSignUp}
                disabled={loading}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
                style={{ background: 'var(--color-primary)' }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {loading ? '가입 중...' : '가입하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
