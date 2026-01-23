"use client"

import Image from "next/image"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <Image
          src="/ifu.png"
          alt="If u?"
          width={120}
          height={48}
          className="mx-auto mb-3"
          priority
        />
        <p className="text-[14px] text-gray-400">너라면 어떻게 할래?</p>
      </div>
      <div className="absolute bottom-16 w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
