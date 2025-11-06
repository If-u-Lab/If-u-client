"use client"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-blue-500 to-primary">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-white" style={{ fontFamily: '"Geist", sans-serif' }}>
          If U?
        </h1>
        <p className="text-xl text-white/80">이 상황에 너라면?</p>
      </div>
      <div className="absolute bottom-8 w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
