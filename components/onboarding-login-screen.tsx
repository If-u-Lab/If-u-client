"use client"

import { getGoogleLoginUrl } from "@/lib/auth-api"
import { SparklesIcon } from "@heroicons/react/24/outline"

export function OnboardingLoginScreen() {
  const handleGoogleLogin = () => {
    const loginUrl = getGoogleLoginUrl()
    window.location.href = loginUrl
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-20 pb-12">
      {/* 상단 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        {/* 아이콘 */}
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
          <SparklesIcon className="w-10 h-10 text-primary" />
        </div>

        {/* 타이틀 */}
        <h2 className="text-2xl font-bold text-gray-900 leading-tight text-center">
          준비 완료!
        </h2>

        {/* 설명 */}
        <p className="text-gray-500 text-[14px] leading-relaxed text-center mt-4">
          이제 로그인하고<br />
          다른 사람들의 선택을 확인해보세요
        </p>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="w-full max-w-sm mx-auto">
        <button
          onClick={handleGoogleLogin}
          className="w-full h-14 bg-white border-2 border-gray-200 text-gray-800 rounded-2xl font-semibold text-[16px] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-sm"
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
          Google로 계속하기
        </button>

        <p className="text-[12px] text-gray-400 text-center mt-4">
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}
