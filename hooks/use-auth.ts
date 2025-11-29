"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getMe,
  logout as apiLogout,
  deleteAccount as apiDeleteAccount,
  refreshAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
  removeStoredAccessToken,
  type User,
} from "@/lib/auth-api"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  /**
   * 로그인 처리 (OAuth 콜백에서 호출)
   */
  const login = useCallback(async (token: string) => {
    try {
      setStoredAccessToken(token)
      setAccessToken(token)

      const userData = await getMe(token)
      setUser(userData)
    } catch (error) {
      console.error("로그인 실패:", error)
      removeStoredAccessToken()
      setAccessToken(null)
      setUser(null)
      throw error
    }
  }, [])

  /**
   * 로그아웃 처리
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error("로그아웃 API 실패:", error)
    } finally {
      // API 실패 여부와 관계없이 로컬 상태 초기화
      removeStoredAccessToken()
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  /**
   * 회원 탈퇴 처리
   */
  const deleteAccount = useCallback(async () => {
    if (!accessToken) {
      throw new Error("로그인이 필요합니다")
    }

    try {
      await apiDeleteAccount(accessToken)
      removeStoredAccessToken()
      setAccessToken(null)
      setUser(null)
    } catch (error) {
      console.error("회원 탈퇴 실패:", error)
      throw error
    }
  }, [accessToken])

  /**
   * 토큰 갱신 처리
   */
  const refreshToken = useCallback(async () => {
    try {
      const newToken = await refreshAccessToken()
      setStoredAccessToken(newToken)
      setAccessToken(newToken)
      return newToken
    } catch (error) {
      console.error("토큰 갱신 실패:", error)
      // 갱신 실패 시 로그아웃 처리
      removeStoredAccessToken()
      setAccessToken(null)
      setUser(null)
      throw error
    }
  }, [])

  /**
   * 초기 인증 상태 확인
   */
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      const storedToken = getStoredAccessToken()

      if (!storedToken) {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        if (isMounted) setAccessToken(storedToken)
        const userData = await getMe(storedToken)
        if (isMounted) setUser(userData)
      } catch (error: any) {
        console.error("인증 상태 확인 실패:", error)

        // 401 에러인 경우에만 토큰 갱신 시도
        if (error?.status === 401) {
          try {
            const newToken = await refreshAccessToken()
            if (isMounted) {
              setStoredAccessToken(newToken)
              setAccessToken(newToken)
            }
            const userData = await getMe(newToken)
            if (isMounted) setUser(userData)
          } catch (refreshError) {
            console.error("토큰 갱신 실패:", refreshError)
            removeStoredAccessToken()
            if (isMounted) {
              setAccessToken(null)
              setUser(null)
            }
          }
        } else {
          // 401이 아닌 다른 에러는 토큰 갱신 시도 없이 바로 로그아웃 처리
          removeStoredAccessToken()
          if (isMounted) {
            setAccessToken(null)
            setUser(null)
          }
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initAuth()

    // cleanup: 컴포넌트 언마운트 시 상태 업데이트 방지
    return () => {
      isMounted = false
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    accessToken,
    login,
    logout,
    deleteAccount,
    refreshToken,
  }
}