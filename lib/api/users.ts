// User API 서비스 함수

import { apiGet } from "@/lib/api-client"
import type { UserResponse } from "@/types/api"

const BASE_PATH = "/api/v1/users"

/**
 * 내 정보 조회
 */
export async function getMe() {
  return apiGet<UserResponse>(`${BASE_PATH}/me`)
}
