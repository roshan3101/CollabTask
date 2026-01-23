'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'

const reasons = [
  {
    title: 'Backend-First Architecture',
    description:
      'Built on a scalable, resilient backend designed by experienced systems engineers. Our architecture handles millions of concurrent operations with ease.',
  },
  {
    title: 'Enterprise Security & Compliance',
    description:
      'Role-based access control, encryption at rest and in transit, and comprehensive audit logging for regulatory compliance.',
  },
  {
    title: 'Concurrency Control',
    description:
      'Advanced conflict resolution and optimistic locking ensure data integrity even with thousands of simultaneous edits.',
  },
  {
    title: 'Audit Trails & Accountability',
    description:
      'Complete activity logs track every action, every change, and every user interaction. Never lose visibility into your workspace.',
  },
]

export function WhyCollabTask() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(containerRef.current?.children || []).indexOf(
              entry.target as Element,
            )
            if (index >= 0) {
              setVisibleCards((prev) => [...new Set([...prev, index])])
            }
          }
        })
      },
      { threshold: 0.1 },
    )

    containerRef.current?.children &&
      Array.from(containerRef.current.children).forEach((child) => {
        observer.observe(child)
      })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="w-full py-20 px-4 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            Why CollabTask?
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            We've built CollabTask from first principles with enterprise-grade reliability, security,
            and performance.
          </p>
        </div>

        {/* Reasons grid */}
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => {
            const isVisible = visibleCards.includes(index)

            return (
              <div
                key={reason.title}
                className={`transform transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : '0ms',
                }}
              >
                <Card className="h-full p-8 bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">{reason.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{reason.description}</p>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
