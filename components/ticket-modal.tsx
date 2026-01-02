"use client"

import { TicketIcon } from "@heroicons/react/24/outline"

interface TicketModalProps {
  isOpen: boolean
  ticketCount: number
  isUsing: boolean
  onUse: () => void
  onClose: () => void
}

export function TicketModal({
  isOpen,
  ticketCount,
  isUsing,
  onUse,
  onClose,
}: TicketModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl border border-border p-6 mx-5 max-w-sm w-full shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <TicketIcon className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            열람권을 사용하시겠어요?
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            종료된 질문의 결과를 확인할 수 있어요
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            보유 열람권: <span className="font-semibold text-primary">{ticketCount}개</span>
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={onUse}
              disabled={ticketCount === 0 || isUsing}
              className={`w-full py-3 px-4 rounded-xl font-medium text-[15px] active:scale-95 transition-transform ${
                ticketCount > 0 && !isUsing
                  ? "bg-primary/60 text-white"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isUsing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  사용 중...
                </span>
              ) : ticketCount > 0 ? (
                "열람권 사용하기"
              ) : (
                "열람권이 없어요"
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-muted text-muted-foreground rounded-xl font-medium text-[15px] active:scale-95 transition-transform"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
