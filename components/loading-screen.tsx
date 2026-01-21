"use client"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[oklch(0.55_0.22_264)] via-[oklch(0.51_0.24_266)] to-[oklch(0.47_0.26_268)]">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black text-white tracking-tighter">
          If U?
        </h1>
        <p className="text-xl text-white/80">너라면 어떻게 할래?</p>
      </div>
      <div className="absolute bottom-8 w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
