import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { Loader2, User, Camera, FileText, Globe, CodeXml, Wrench } from 'lucide-react'
import type { UserProfile } from './types'
import { API_BASE } from '../api/apiBase'
import { readJsonResponse } from '../api/http'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

interface Props {
  token: string
  onComplete: () => void
  onSkip: () => void
}

export default function FreelancerSetup({ token, onComplete, onSkip }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [bio, setBio] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [token])

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await readJsonResponse<{ data?: UserProfile }>(res)
      if (res.ok && body?.data) {
        const p = body.data
        setBio(p.bio ?? '')
        setWebsiteUrl(p.website_url ?? '')
        setGithubUrl(p.github_url ?? '')
        setAvatarUrl(p.avatar_url ?? '')
        setSkills(p.skills ?? [])
      }
    } catch {
      // ignore - fresh profile
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('허용되지 않는 파일 형식입니다. (jpg, png, gif, webp만 가능)')
      return
    }

    if (file.size > MAX_SIZE) {
      setUploadError('파일 크기가 5MB를 초과합니다.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const body = await readJsonResponse<{ url?: string; error?: string }>(res)
      if (!res.ok || !body?.url) {
        throw new Error(body?.error ?? '업로드에 실패했습니다.')
      }
      setAvatarUrl(body.url)
      setAvatarPreview(null)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.')
      setAvatarPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function addSkill() {
    const s = skillInput.trim()
    if (!s) return
    if (!skills.includes(s)) {
      setSkills((prev) => [...prev, s])
    }
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        bio: bio || null,
        website_url: websiteUrl || null,
        github_url: githubUrl || null,
        avatar_url: avatarUrl || null,
        skills,
      }

      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const body = await readJsonResponse<{ error?: string }>(res)
      if (!res.ok) throw new Error(body?.error ?? '저장에 실패했습니다.')
      onComplete()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-default, #f6f8fa)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}><Loader2 className="w-8 h-8 animate-spin" /></div>
          <div>프로필을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-default, #f6f8fa)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-default, #fff)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>O</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Crewlink</div>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div className="card" style={{ maxWidth: 600, width: '100%' }}>
          <div className="card-body" style={{ padding: 32 }}>
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><User className="w-10 h-10" /></div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>프리랜서 프로필 설정</h1>
              <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                클라이언트가 вас를 찾을 수 있도록 프로필을 작성해주세요.<br />
                나중에 프로필 페이지에서 언제든지 수정할 수 있습니다.
              </p>
            </div>

            {/* Avatar */}
            <div style={{ marginBottom: 24 }}>
                <label className="form-label"><Camera className="w-4 h-4 inline" /> 프로필 사진</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: (avatarUrl || avatarPreview) ? 'transparent' : 'linear-gradient(135deg, var(--accent), #7c3aed)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'white',
                    border: '3px solid var(--surface)',
                    boxShadow: 'var(--shadow-md)',
                    flexShrink: 0,
                  }}
                >
                  {(avatarUrl || avatarPreview) ? (
                    <img
                      src={avatarPreview || avatarUrl}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="avatar-upload"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ fontSize: 13 }}
                  >
                    {uploading ? '업로드 중...' : '파일 선택'}
                  </button>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    JPG, PNG, GIF, WEBP / 최대 5MB
                  </div>
                  {uploadError && (
                    <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                      {uploadError}
                    </div>
                  )}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => { setAvatarUrl(''); setAvatarPreview(null) }}
                      style={{ fontSize: 12, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, padding: 0 }}
                    >
                      사진 제거
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label"><FileText className="w-4 h-4 inline" /> 자기소개</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자신을 소개해주세요. 전문 분야, 경험, 작업 스타일 등을 작성하면 클라이언트가 더 쉽게 вас를 이해할 수 있습니다."
                maxLength={1500}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                {bio.length}/1500
              </div>
            </div>

            {/* URLs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label className="form-label"><Globe className="w-4 h-4 inline" /> 포트폴리오 사이트</label>
                <input
                  className="form-input"
                  value={websiteUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>
              <div>
                <label className="form-label"><CodeXml className="w-4 h-4 inline" /> GitHub</label>
                <input
                  className="form-input"
                  value={githubUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 24 }}>
              <label className="form-label"><Wrench className="w-4 h-4 inline" /> 기술 스택</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 10px',
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 500,
                      border: '1px solid rgba(37,99,235,0.15)',
                    }}
                  >
                    {s}
                    <button
                      onClick={() => removeSkill(s)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0 2px',
                        lineHeight: 1,
                        color: 'var(--accent)',
                        fontSize: 11,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  value={skillInput}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addSkill() }
                  }}
                  placeholder="기술 입력 후 Enter 또는 추가 클릭"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={addSkill} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  + 추가
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--error-light)',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                color: 'var(--error)',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost" onClick={onSkip}>
                건너뛰기
              </button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? '저장 중...' : '프로필 저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
