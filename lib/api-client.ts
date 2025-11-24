// API 클라이언트 기본 설정
// 모든 API 호출에 공통으로 사용되는 fetch wrapper

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/**
 * 백엔드 공통 응답 형식
 */
export interface ApiResponse<T> {
  timestamp: string
  status: number
  code: string
  message?: string
  data: T
}

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * API fetch wrapper
 * - 공통 헤더 설정
 * - 에러 처리
 * - JSON 파싱
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  const json = await response.json()

  if (!response.ok) {
    throw new ApiError(
      json.status || response.status,
      json.code || "UNKNOWN_ERROR",
      json.message || "알 수 없는 오류가 발생했습니다"
    )
  }

  return json as ApiResponse<T>
}

/**
 * GET 요청 헬퍼
 */
export function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, { method: "GET" })
}

/**
 * POST 요청 헬퍼
 */
export function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT 요청 헬퍼
 */
export function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE 요청 헬퍼
 */
export function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, { method: "DELETE" })
}
