'use client'

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="font-bold text-xl text-foreground mb-2">CollabTask</div>
            <p className="text-sm text-foreground/60">
              Real-time collaboration for modern teams
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Security</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Roadmap</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">About</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Privacy</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Terms</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Compliance</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-foreground text-sm transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* Bottom content */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground/50">
              © 2025 CollabTask. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">GitHub</a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
