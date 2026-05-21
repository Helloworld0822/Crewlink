import React, { useMemo, useState } from 'react'
import {
  ThemeProvider,
  BaseStyles,
  Box,
  Heading,
  Text,
  Button,
  TextInput,
  Avatar,
  Label,
  ActionList,
  AvatarStack,
  StyledOcticon,
  Badge,
} from '@primer/react'
import { SearchIcon } from '@primer/octicons-react'
import './App.css'

type Project = {
  id: string
  title: string
  description: string
  skills: string[]
  budget: string
  client: { name: string; avatar?: string }
}

const mockProjects: Project[] = [
  {
    id: 'p1',
    title: '모바일 앱용 결제 화면 디자인 및 구현',
    description: '결제 플로우와 UI/UX 개선, React로 구현 가능한 컴포넌트 제공',
    skills: ['React', 'TypeScript', 'Design'],
    budget: '₩1,200,000',
    client: { name: '스타트업 A' },
  },
  {
    id: 'p2',
    title: '콘텐츠 관리 CMS 구축',
    description: '간단한 관리자 페이지와 API 연동, 인증 포함',
    skills: ['React', 'Node', 'REST API'],
    budget: '₩2,500,000',
    client: { name: '미디어 B' },
  },
  {
    id: 'p3',
    title: '프로토타입: 이커머스 카탈로그',
    description: '검색/필터, 제품 카드, 반응형 레이아웃',
    skills: ['React', 'CSS', 'Accessibility'],
    budget: '₩900,000',
    client: { name: '샵 C' },
  },
]

function ProjectCard({ p }: { p: Project }) {
  return (
    <Box
      borderWidth={1}
      borderStyle="solid"
      borderColor="border.muted"
      borderRadius={6}
      padding={3}
      backgroundColor="canvas.subtle"
      mb={3}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Heading as="h3" sx={{ fontSize: 2 }}>
            {p.title}
          </Heading>
          <Text color="fg.muted" sx={{ mt: 1 }}>
            {p.description}
          </Text>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {p.skills.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </Box>
        </Box>
        <Box textAlign="right">
          <Text sx={{ fontWeight: 'bold' }}>{p.budget}</Text>
          <Box sx={{ mt: 2 }}>
            <Button variant="primary">제안하기</Button>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar alt={p.client.name} />
        <Text>{p.client.name}</Text>
      </Box>
    </Box>
  )
}

export default function App(): JSX.Element {
  const [query, setQuery] = useState('')
  const [skillFilter, setSkillFilter] = useState<string | null>(null)

  const skills = useMemo(() => {
    const s = new Set<string>()
    mockProjects.forEach((p) => p.skills.forEach((k) => s.add(k)))
    return Array.from(s)
  }, [])

  const filtered = useMemo(() => {
    return mockProjects.filter((p) => {
      const matchesQuery = query.trim() === '' || p.title.includes(query) || p.description.includes(query)
      const matchesSkill = !skillFilter || p.skills.includes(skillFilter)
      return matchesQuery && matchesSkill
    })
  }, [query, skillFilter])

  return (
    <ThemeProvider>
      <BaseStyles>
        <Box px={4} py={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Heading as="h1">Outsourcing Hub</Heading>
              <Text color="fg.muted">프리랜서와 클라이언트를 연결하는 외주 중개 플랫폼 (Primer 스타일)</Text>
            </Box>
            <Box>
              <Button sx={{ mr: 2 }} variant="invisible">로그인</Button>
              <Button variant="primary">회원가입</Button>
            </Box>
          </Box>

          <Box display="grid" gridTemplateColumns={[ '1fr', '320px 1fr' ]} gap={4}>
            <Box>
              <Box
                borderWidth={1}
                borderStyle="solid"
                borderColor="border.muted"
                borderRadius={6}
                padding={3}
                backgroundColor="canvas.default"
              >
                <Heading as="h2" sx={{ fontSize: 1 }}>검색</Heading>
                <Box sx={{ mt: 2 }}>
                  <Label>프로젝트 검색</Label>
                  <TextInput
                    leadingVisual={() => <StyledOcticon icon={SearchIcon} />}
                    placeholder="검색어를 입력하세요 (예: React)"
                    value={query}
                    onChange={(e: any) => setQuery(e.target.value)}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Heading as="h3" sx={{ fontSize: 1 }}>기술 필터</Heading>
                  <ActionList>
                    {['(전체)', ...skills].map((s) => (
                      <ActionList.Item
                        key={s}
                        onSelect={() => setSkillFilter(s === '(전체)' ? null : s)}
                        aria-current={skillFilter === s}
                      >
                        <ActionList.LeadingVisual>
                          <Avatar />
                        </ActionList.LeadingVisual>
                        <ActionList.TrailingVisual>{skillFilter === s || (s === '(전체)' && skillFilter === null) ? '•' : ''}</ActionList.TrailingVisual>
                        {s}
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Heading as="h3" sx={{ fontSize: 1 }}>Top 클라이언트</Heading>
                  <AvatarStack>
                    <Avatar alt="Client A" />
                    <Avatar alt="Client B" />
                    <Avatar alt="Client C" />
                  </AvatarStack>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box
                borderRadius={6}
                padding={4}
                backgroundColor="canvas.subtle"
                mb={4}
              >
                <Heading as="h2">프로젝트 찾기</Heading>
                <Text color="fg.muted" sx={{ mt: 2 }}>
                  수많은 외주 프로젝트 중에서 원하는 기술과 예산으로 빠르게 매칭하세요.
                </Text>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button variant="primary">프로젝트 등록</Button>
                  <Button variant="secondary">프리랜서 보기</Button>
                </Box>
              </Box>

              {filtered.length === 0 ? (
                <Box>
                  <Text>검색 결과가 없습니다.</Text>
                </Box>
              ) : (
                filtered.map((p) => <ProjectCard key={p.id} p={p} />)
              )}
            </Box>
          </Box>

          <Box as="footer" sx={{ mt: 6, borderTop: '1px solid', borderColor: 'border.muted', pt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Text color="fg.muted">© {new Date().getFullYear()} Outsourcing Hub</Text>
              <Box>
                <Button variant="invisible">회사정보</Button>
                <Button variant="invisible">약관</Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  )
}
