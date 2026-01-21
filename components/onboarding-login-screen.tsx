"use client"

import { getGoogleLoginUrl } from "@/lib/auth-api"
import { SparklesIcon } from "@heroicons/react/24/outline"

export function OnboardingLoginScreen() {
  const handleGoogleLogin = () => {
    const loginUrl = getGoogleLoginUrl()
    window.location.href = loginUrl
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.55_0.22_264)] via-[oklch(0.51_0.24_266)] to-[oklch(0.47_0.26_268)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl" />
      </div>

      <div className="text-center space-y-10 max-w-sm relative z-10">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/20">
            <SparklesIcon className="w-14 h-14 text-white" />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">
            준비 완료!
          </h2>
          <p className="text-white/90 text-base leading-relaxed">
            이제 로그인하고<br />
            다른 사람들의 선택을 확인해보세요
          </p>
        </div>

        {/* Google 로그인 버튼 */}
        <div className="pt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full h-14 bg-white text-gray-700 rounded-xl font-semibold text-base transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google 계정으로 시작하기
          </button>
        </div>

        <p className="text-xs text-white/90 px-4 -mt-4">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}