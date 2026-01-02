// Ticket API 서비스 함수

import { apiPost } from "@/lib/api-client"
import type { TicketUseResponse } from "@/types/api"

const BASE_PATH = "/api/v1/tickets"

/**
 * 열람권 사용
 * @param questionId 열람할 질문 ID
 */
export async function useTicket(questionId: number) {
  return apiPost<TicketUseResponse>(`${BASE_PATH}/use`, { questionId })
}
