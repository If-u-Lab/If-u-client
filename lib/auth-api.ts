/**
 * Auth API Service
 * 인증 관련 API 호출을 담당하는 서비스 레이어
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// API 응답 공통 타입
interface ApiResponse<T> {
  timestamp: string
  status: number
  code: string
  message: string
  data: T
}

// 사용자 정보 타입
export interface User {
  id: number
  nickname: string
  email?: string 
  providerId: string
  role: "USER" | "ADMIN"
  isDeleted: boolean
  notificationEnabled: boolean 
  stats?: {
    totalVotes: number
    totalComments: number
    participationRate: number
  }
}

// 토큰 갱신 응답 타입
interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

/**
 * Google OAuth 로그인 URL 생성
 */
export function getGoogleLoginUrl(): string {
  return `${API_URL}/oauth2/authorization/google`
}

/**
 * 내 정보 조회
 */
export async function getMe(accessToken: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    credentials: "include", // 쿠키 포함
  })

  if (!response.ok) {
    // 401 에러인 경우 별도 처리를 위해 status를 포함한 에러 throw
    const error = new Error(`Failed to fetch user info: ${response.status}`)
    ;(error as any).status = response.status
    throw error
  }

  const result: ApiResponse<User> = await response.json()
  return result.data
}

/**
 * 토큰 갱신
 */
export async function refreshAccessToken(): Promise<string> {
  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include", // refreshToken 쿠키 자동 포함
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`)
  }

  const result: ApiResponse<RefreshTokenResponse> = await response.json()
  return result.data.accessToken
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include", // refreshToken 쿠키 포함
  })

  if (!response.ok) {
    throw new Error(`Logout failed: ${response.status}`)
  }
}

/**
 * 회원 탈퇴
 */
export async function deleteAccount(accessToken: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Account deletion failed: ${response.status}`)
  }
}

/**
 * localStorage에서 accessToken 가져오기
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

/**
 * localStorage에 accessToken 저장
 */
export function setStoredAccessToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("access_token", token)
}

/**
 * localStorage에서 accessToken 삭제
 */
export function removeStoredAccessToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("access_token")
}