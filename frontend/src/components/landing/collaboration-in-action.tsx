'use client'

import { useEffect, useRef, useState } from 'react'

export function CollaborationInAction() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    }, { threshold: 0.2 })

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 px-4 bg-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            Collaboration in Action
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            See how real-time updates, comments, and notifications keep teams synchronized and productive
          </p>
        </div>

        {/* Timeline/Flow visualization */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Timeline item 1 */}
            <div
              className={`flex gap-6 transform transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
              style={{ transitionDelay: isVisible ? '0s' : '0ms' }}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold mb-2">
                  1
                </div>
                <div className="w-1 h-16 bg-gradient-to-b from-blue-500 to-transparent"></div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Team Member Updates a Task
                </h3>
                <p className="text-foreground/60">
                  Any team member makes a change to a task or project. The update is instantly processed and broadcast via WebSockets.
                </p>
              </div>
            </div>

            {/* Timeline item 2 */}
            <div
              className={`flex gap-6 transform transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
              style={{ transitionDelay: isVisible ? '0.1s' : '0ms' }}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold mb-2">
                  2
                </div>
                <div className="w-1 h-16 bg-gradient-to-b from-cyan-500 to-transparent"></div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Real-time Live Updates
                </h3>
                <p className="text-foreground/60">
                  All connected team members see the change immediately on their screens, no refresh needed. Concurrent editing is handled gracefully.
                </p>
              </div>
            </div>

            {/* Timeline item 3 */}
            <div
              className={`flex gap-6 transform transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
              style={{ transitionDelay: isVisible ? '0.2s' : '0ms' }}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold mb-2">
                  3
                </div>
                <div className="w-1 h-16 bg-gradient-to-b from-blue-600 to-transparent"></div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Comments & Notifications
                </h3>
                <p className="text-foreground/60">
                  Team members can comment on tasks, and all participants are notified instantly. Mention teammates with @mentions for direct communication.
                </p>
              </div>
            </div>

            {/* Timeline item 4 */}
            <div
              className={`flex gap-6 transform transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
              style={{ transitionDelay: isVisible ? '0.3s' : '0ms' }}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold">
                  4
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Activity Logged & Audited
                </h3>
                <p className="text-foreground/60">
                  Every action is recorded in our comprehensive audit trail. Track who made changes, when they were made, and why for complete accountability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-20 border-t border-white/10">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">&lt;100ms</div>
            <p className="text-foreground/60">Average update latency</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
            <p className="text-foreground/60">Uptime guarantee</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-300 mb-2">∞</div>
            <p className="text-foreground/60">Concurrent users</p>
          </div>
        </div>
      </div>
    </section>
  )
}
