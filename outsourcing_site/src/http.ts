export async function readJsonResponse<T>(res: Response): Promise<T | null> {
  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

/**
 * 백엔드의 error 필드가 문자열이거나 Ecto changeset 오류 객체일 수 있어서
 * 항상 사람이 읽을 수 있는 문자열로 변환합니다.
 *
 * 예) {email: ["has already been taken"]} → "email: has already been taken"
 */
export function formatError(error: unknown, fallback = '요청 실패'): string {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (typeof error === 'object' && !Array.isArray(error)) {
    return Object.entries(error as Record<string, unknown>)
      .map(([field, msgs]) => {
        const msgStr = Array.isArray(msgs) ? msgs.join(', ') : String(msgs)
        return `${field}: ${msgStr}`
      })
      .join(' / ')
  }
  return fallback
}
