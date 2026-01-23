'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function FinalCTA() {
  const router = useRouter()

  return (
    <section className="w-full py-20 px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-blue-600/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
          Ready to Transform Your Team?
        </h2>

        {/* Subheading */}
        <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of teams using CollabTask to collaborate smarter, ship faster, and stay connected across timezones.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold h-12 px-8 rounded-lg group"
            onClick={() => router.push('/signup')}
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border border-white/20 text-foreground hover:bg-white/10 font-semibold h-12 px-8 rounded-lg bg-transparent"
            onClick={() => router.push('/login')}
          >
            Log In
          </Button>
        </div>

        {/* Subtext */}
        <p className="mt-8 text-sm text-foreground/50">
          No credit card required • 14-day free trial • Full access to all features
        </p>
      </div>
    </section>
  )
}
