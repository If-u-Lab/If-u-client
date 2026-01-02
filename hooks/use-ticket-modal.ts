"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUserProfile } from "@/hooks/use-user-profile"
import * as ticketsApi from "@/lib/api/tickets"
import type { Question } from "@/types/entities"

export function useTicketModal() {
  const router = useRouter()
  const { profile, fetchProfile } = useUserProfile()
  const [showModal, setShowModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isUsing, setIsUsing] = useState(false)

  const ticketCount = profile.ticketCount

  const openModal = useCallback((question: Question) => {
    setSelectedQuestion(question)
    setShowModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setSelectedQuestion(null)
  }, [])

  const useTicket = useCallback(async () => {
    if (!selectedQuestion || ticketCount === 0) return

    try {
      setIsUsing(true)
      await ticketsApi.useTicket(Number(selectedQuestion.id))
      fetchProfile()
      router.push(`/questions/${selectedQuestion.id}`)
    } catch (error) {
      toast.error("열람권 사용에 실패했습니다")
    } finally {
      setIsUsing(false)
      closeModal()
    }
  }, [selectedQuestion, ticketCount, fetchProfile, router, closeModal])

  // 질문 클릭 핸들러 - 종료된 질문이면 모달 표시, 아니면 이동
  const handleQuestionClick = useCallback((question: Question, hasVoted: boolean) => {
    const canView = question.canViewResults ?? hasVoted
    const isClosedWithoutAccess = question.status === "CLOSED" && !canView

    if (isClosedWithoutAccess) {
      openModal(question)
    } else {
      router.push(`/questions/${question.id}`)
    }
  }, [openModal, router])

  return {
    showModal,
    selectedQuestion,
    isUsing,
    ticketCount,
    openModal,
    closeModal,
    useTicket,
    handleQuestionClick,
  }
}
