import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh">
      {/* Readability scrim over existing background */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/50 md:bg-black/40" />

      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
          Simple workforce management
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-white/70">
          Capture business details, define hours, and add employees. Nothing extra.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Button asChild size="lg" className="px-6 bg-white text-black hover:bg-white/90">
            <Link href="/onboarding">Start Onboarding</Link>
          </Button>
          <Link
            href="#details"
            className="text-sm text-white/80 underline underline-offset-4 hover:text-white"
          >
            Learn more
          </Link>
        </div>

        <ul id="details" className="mt-8 grid gap-2 text-white/70">
          <li>• Clean shop info</li>
          <li>• Weekday/weekend hours</li>
          <li>• Roles, salary &amp; skills</li>
        </ul>
      </section>
    </main>
  )
}
