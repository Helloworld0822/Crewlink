import React, { useState } from 'react'
import { Box, TextInput, Label, Button, Heading, Text } from '@primer/react'

export default function LoginPanel({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submitLogin() {
    setLoading(true)
    setError(null)
    try {
      const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000'
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error || '로그인 실패')
      } else {
        const body = await res.json()
        localStorage.setItem('token', body.token)
        onLogin(body.token)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'border.muted', borderRadius: 6, p: 3, width: 320 }}>
      <Heading as="h3">로그인</Heading>
      <Box sx={{ mt: 2 }}>
        <Label>이메일</Label>
        <TextInput value={email} onChange={(e: any) => setEmail(e.target.value)} />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Label>비밀번호</Label>
        <TextInput type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
      </Box>
      {error && (
        <Text color="danger.fg" sx={{ mt: 2 }}>{error}</Text>
      )}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="primary" onClick={submitLogin} disabled={loading}>{loading ? '로그인...' : '로그인'}</Button>
      </Box>
    </Box>
  )
}
