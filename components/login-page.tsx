"use client"
import { useOnboarding } from "@/hooks/use-onboarding"
import { InitialLoginScreen } from "@/components/initial-login-screen"
import { OnboardingCarousel } from "@/components/onboarding-carousel"
import { OnboardingLoginScreen } from "@/components/onboarding-login-screen"

interface LoginPageProps {
  onLoginSuccess: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { step, proceed, goBack } = useOnboarding()

  if (step === "initial") {
    return <InitialLoginScreen onStartOnboarding={proceed} />
  }

  if (step === "slides") {
    return <OnboardingCarousel onComplete={() => proceed()} />
  }

  if (step === "login") {
    return <OnboardingLoginScreen />
  }

  return null
}
