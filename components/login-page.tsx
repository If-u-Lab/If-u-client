"use client"
import { useOnboarding } from "@/hooks/use-onboarding"
import { InitialLoginScreen } from "@/components/initial-login-screen"
import { OnboardingCarousel } from "@/components/onboarding-carousel"
import { OnboardingPreferences } from "@/components/onboarding-preferences"
import { OnboardingComplete } from "@/components/onboarding-complete"

interface LoginPageProps {
  onLoginSuccess: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { step, preferences, proceed, goBack } = useOnboarding()

  if (step === "initial") {
    return <InitialLoginScreen onStartOnboarding={proceed} />
  }

  if (step === "slides") {
    return <OnboardingCarousel onComplete={() => proceed()} />
  }

  if (step === "preferences") {
    return (
      <OnboardingPreferences
        notificationsEnabled={preferences.notificationsEnabled}
        onToggleNotifications={() => {
          // Handle notification toggle
        }}
        onNext={proceed}
        onBack={goBack}
      />
    )
  }

  if (step === "complete") {
    return <OnboardingComplete onFinish={onLoginSuccess} />
  }

  return null
}
