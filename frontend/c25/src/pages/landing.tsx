// app/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh">
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/50 md:bg-black/40" />
      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
          Simple workforce management
        </h1>
        <p className="mt-4 max-w-2xl text-base md:text-lg text-white/70">
          Capture business details, define hours, and add employees.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="px-6 bg-white text-black hover:bg-white/90">
            <Link href="/onboarding">I’m an Employer</Link>
          </Button>
          {/* ⬇️ Now goes to /workers */}
          <Button asChild size="lg" variant="outline" className="px-6 border-white/50 text-black">
            <Link href="/worker">I’m a Worker</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
