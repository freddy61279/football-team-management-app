import Link from 'next/link'
import { ArrowUpRight, CalendarDays, Check, ChevronRight, CircleUserRound, ShieldCheck, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { icon: CircleUserRound, title: 'Squad intelligence', copy: 'Keep every player, position, and availability detail in one clear view.' },
  { icon: CalendarDays, title: 'Training rhythm', copy: 'Plan sessions, share the details, and keep attendance moving.' },
  { icon: ShieldCheck, title: 'Built for the club', copy: 'A focused workspace for coaches, captains, and team staff.' },
]

export default function Page() {
  return (
    <main className="min-h-svh overflow-hidden bg-background">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-border/60 py-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Clubhouse home">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/10">
              <Trophy className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Clubhouse<span className="text-accent">.</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <a href="#features" className="transition-colors hover:text-foreground">Platform</a>
            <a href="#approach" className="transition-colors hover:text-foreground">Our approach</a>
            <Link href="/auth/login" className="font-medium text-foreground">Sign in</Link>
          </nav>
          <Button render={<Link href="/auth/sign-up" />} size="sm" className="hidden sm:inline-flex">Get started <ArrowUpRight data-icon="inline-end" /></Button>
        </header>

        <section className="relative grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="size-1.5 rounded-full bg-accent" /> Team operations, simplified
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-7xl">
              The season starts with a <span className="text-accent">better rhythm.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">One calm, capable workspace for managing your squad, organizing training, and keeping everyone ready for matchday.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button render={<Link href="/auth/sign-up" />} size="lg">Create your club <ArrowUpRight data-icon="inline-end" /></Button>
              <Button render={<Link href="/auth/login" />} variant="outline" size="lg">Sign in <ChevronRight data-icon="inline-end" /></Button>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground"><span className="flex -space-x-2"><span className="grid size-7 place-items-center rounded-full border-2 border-background bg-secondary text-[10px] font-bold">JD</span><span className="grid size-7 place-items-center rounded-full border-2 border-background bg-accent text-[10px] font-bold text-accent-foreground">MK</span><span className="grid size-7 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-bold">AL</span></span><span>Made for the people behind the team.</span></div>
          </div>

          <div className="relative" id="approach">
            <div className="absolute -inset-8 rounded-[3rem] bg-accent/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="mb-8 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next session</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Thursday, 19:00</h2></div><span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">Confirmed</span></div>
              <div className="rounded-2xl bg-secondary/70 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">First team training</p><p className="mt-1 text-sm text-muted-foreground">North pitch · 90 min</p></div><div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground"><CalendarDays className="size-5" /></div></div><div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground"><Check className="size-4 text-accent" /> 18 players available</div></div>
              <div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl border border-border/70 p-4"><p className="text-2xl font-semibold">24</p><p className="mt-1 text-xs text-muted-foreground">Squad</p></div><div className="rounded-xl border border-border/70 p-4"><p className="text-2xl font-semibold">86%</p><p className="mt-1 text-xs text-muted-foreground">Attendance</p></div><div className="rounded-xl border border-border/70 p-4"><p className="text-2xl font-semibold">12</p><p className="mt-1 text-xs text-muted-foreground">Sessions</p></div></div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-4 border-t border-border/60 py-10 md:grid-cols-3">{features.map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-2xl border border-transparent p-4 transition-colors hover:border-border hover:bg-card"><Icon className="mb-7 size-5 text-accent" /><h3 className="font-semibold">{title}</h3><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{copy}</p></article>)}</section>
      </div>
    </main>
  )
}

