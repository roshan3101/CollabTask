'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Zap, Users, Bell, Lock, Activity } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Real-time Collaboration',
    description: 'WebSocket-powered live updates keep your team synchronized instantly. See changes as they happen.',
  },
  {
    icon: Users,
    title: 'Task & Project Management',
    description: 'Organize work efficiently with intuitive task boards, project timelines, and team workflows.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Stay informed with intelligent alerts for org invites, meetings, comments, and updates.',
  },
  {
    icon: Activity,
    title: 'Activity Logging',
    description: 'Complete audit trails and activity logs for compliance, accountability, and transparency.',
  },
  {
    icon: Users,
    title: 'Multi-tenant Architecture',
    description: 'Enterprise-ready multi-tenancy with isolated workspaces and team management.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Role-based access control, secure authentication, and advanced permission management.',
  },
]

export function Features() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Array.from(containerRef.current?.children || []).indexOf(entry.target as Element)
          if (index >= 0) {
            setVisibleCards((prev) => [...new Set([...prev, index])])
          }
        }
      })
    }, { threshold: 0.1 })

    containerRef.current?.children && Array.from(containerRef.current.children).forEach((child) => {
      observer.observe(child)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="w-full py-20 px-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            Powerful Features Built for Teams
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Everything you need to manage projects, collaborate seamlessly, and keep your team aligned
          </p>
        </div>

        {/* Features grid */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isVisible = visibleCards.includes(index)

            return (
              <div
                key={index}
                className={`transform transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 50}ms` : '0ms',
                }}
              >
                <Card className="h-full p-8 bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                  {/* Icon container */}
                  <div className="mb-6 inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-colors">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-foreground/60 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-0 group-hover:w-12 transition-all duration-300"></div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
