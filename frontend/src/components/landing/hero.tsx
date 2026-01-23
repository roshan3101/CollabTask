'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-20 pt-40">
      {/* Animated background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm animate-fade-in">
          <span className="text-sm font-medium text-foreground">✨ Now Available</span>
        </div>

        {/* Main headline */}
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Collaborate in Real Time
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="text-xl md:text-2xl text-foreground/70 max-w-2xl mx-auto leading-relaxed animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          CollabTask brings your team together with real-time updates, seamless task management, and
          enterprise-grade collaboration tools designed for modern teams.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 px-8 rounded-lg group"
            onClick={() => router.push('/signup')}
          >
            Sign Up
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

        {/* Hero illustration/mockup */}
        <div className="relative max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-blue-500/30 rounded-2xl blur-2xl" />
          <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-2 md:p-4 backdrop-blur-xl">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-600/20 to-cyan-600/20">
              <Image
                src="/dashboard_preview.png"
                alt="CollabTask dashboard preview"
                width={1280}
                height={720}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  )
}
