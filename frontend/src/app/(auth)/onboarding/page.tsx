'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Phase = 'initial' | 'transition' | 'final'

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>('initial')
  const [messageIndex, setMessageIndex] = useState(0)
  const router = useRouter()

  const messages = [
    'Logging you in...',
    'Just a second...',
    'We are setting things up for you',
  ]

  useEffect(() => {
    const timings = [
      { delay: 100, phase: 'initial' as const },
      { delay: 2000, phase: 'transition' as const },
      { delay: 4500, phase: 'final' as const },
    ]

    let currentTimeout: NodeJS.Timeout | undefined

    const setNextPhase = (index: number) => {
      if (index < timings.length) {
        currentTimeout = setTimeout(() => {
          setPhase(timings[index].phase)
          setNextPhase(index + 1)
        }, timings[index].delay)
      }
    }

    setNextPhase(0)

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 1500)

    // After 5 seconds, navigate to dashboard
    const redirectTimeout = setTimeout(() => {
      router.replace('/dashboard')
    }, 5000)

    return () => {
      if (currentTimeout) clearTimeout(currentTimeout)
      clearTimeout(redirectTimeout)
      clearInterval(messageInterval)
    }
  }, [router])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background transition */}
      <div
        className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
          phase === 'initial'
            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500'
            : phase === 'transition'
              ? 'bg-gradient-to-br from-blue-400 via-slate-300 to-slate-100'
              : 'bg-white'
        }`}
      />

      {/* Animated gradient orbs - visible only in initial/transition phase */}
      {phase !== 'final' && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-[2000ms] ${
              phase === 'initial' ? 'bg-blue-400/40' : 'bg-slate-300/10'
            }`}
          />
          <div
            className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-[2000ms] ${
              phase === 'initial' ? 'bg-cyan-400/30' : 'bg-slate-200/5'
            }`}
          />
        </div>
      )}

      {/* Content container */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="text-center space-y-8 z-10">
          {/* Logo/Brand area */}
          <div
            className={`transition-all duration-[1500ms] ${
              phase === 'final' ? 'scale-100 opacity-100' : 'scale-125 opacity-60'
            }`}
          >
            <div
              className={`text-6xl font-bold tracking-tight transition-colors duration-[1500ms] ${
                phase === 'initial'
                  ? 'text-white'
                  : phase === 'transition'
                    ? 'text-slate-700'
                    : 'text-black'
              }`}
            >
              CollabTask
            </div>
          </div>

          {/* Loading indicator */}
          <div className="flex justify-center items-center h-12">
            {phase === 'initial' && (
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            {phase === 'transition' && (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            {phase === 'final' && (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          {/* Dynamic message */}
          <div className="h-8 flex items-center justify-center">
            <p
              className={`text-lg font-medium transition-all duration-500 ${
                phase === 'initial'
                  ? 'text-white/90'
                  : phase === 'transition'
                    ? 'text-slate-700'
                    : 'text-black'
              }`}
            >
              {messages[messageIndex]}
            </p>
          </div>

          {/* Progress bar */}
          {(phase === 'transition' || phase === 'final') && (
            <div className="w-64 h-1 bg-slate-300 rounded-full overflow-hidden mx-auto">
              <div
                className={`h-full transition-all duration-700 ${
                  phase === 'transition' ? 'w-1/2 bg-slate-600' : 'w-full bg-black'
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-[1500ms] ${
          phase === 'initial'
            ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
            : phase === 'transition'
              ? 'bg-gradient-to-r from-slate-400 to-slate-600'
              : 'bg-slate-200'
        }`}
      />
    </div>
  )
}

