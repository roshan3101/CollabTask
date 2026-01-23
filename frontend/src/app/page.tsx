'use client'

import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { CollaborationInAction } from '@/components/landing/collaboration-in-action'
import { WhyCollabTask } from '@/components/landing/why-collabtask'
import { FinalCTA } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <main className="w-full overflow-hidden bg-background">
      <Hero />
      <Features />
      <CollaborationInAction />
      <WhyCollabTask />
      <FinalCTA />
      <Footer />
    </main>
  )
}
