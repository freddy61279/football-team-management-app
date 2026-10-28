import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <section className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Football team management
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Manage your team with confidence.</h1>
        <p className="mt-4 text-muted-foreground">
          Sign in to manage your squad, or create an account to get started.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/sign-up">Create account</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

