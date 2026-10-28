import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowUpRight, ShieldCheck, UsersRound } from "lucide-react"

type AuthShellProps = {
  mode: "sign-in" | "sign-up"
  children: ReactNode
}

export function AuthShell({ mode, children }: AuthShellProps) {
  const isSignUp = mode === "sign-up"

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <aside className="auth-story-panel" aria-labelledby="auth-story-title">
          <Link className="auth-brand" href="/" aria-label="Touchline home">
            <span className="auth-brand-symbol" aria-hidden="true">T</span>
            <span className="auth-brand-copy">
              <strong>TOUCHLINE</strong>
              <span>CLUB OPERATIONS</span>
            </span>
          </Link>

          <div className="auth-story-content">
            <p className="auth-story-kicker">THE WORK BEHIND THE WHISTLE</p>
            <h1 id="auth-story-title">The team<br />behind <span>the team.</span></h1>
            <p className="auth-story-description">
              A clearer home for your club, from the first training session to matchday.
            </p>
          </div>

          <div className="auth-insight-card">
            <div className="auth-insight-heading">
              <span className="auth-insight-icon" aria-hidden="true"><UsersRound /></span>
              <div>
                <span className="auth-insight-kicker">ONE CLUB WORKSPACE</span>
                <strong>Everything in step.</strong>
              </div>
              <ArrowUpRight className="auth-insight-arrow" aria-hidden="true" />
            </div>
            <div className="auth-capability-list" aria-label="Club workspace features">
              <span><i aria-hidden="true" /> Club profile</span>
              <span><i aria-hidden="true" /> Squad planning</span>
              <span><i aria-hidden="true" /> Matchday tools</span>
            </div>
          </div>

          <p className="auth-story-footer">
            <ShieldCheck aria-hidden="true" /> BUILT FOR THE PEOPLE BEHIND THE BADGE
          </p>
          <div className="auth-story-mark" aria-hidden="true">T</div>
        </aside>

        <section className="auth-panel" aria-label={isSignUp ? "Create a Touchline account" : "Sign in to Touchline"}>
          <header className="auth-panel-topline">
            <span>{isSignUp ? "NEW CLUB / ACCESS" : "MEMBER / ACCESS"}</span>
            <span className="auth-preview-status"><i aria-hidden="true" /> VISUAL PREVIEW</span>
          </header>

          <div className="auth-panel-content">
            <div className="auth-title-block">
              <p className="auth-section-kicker">{isSignUp ? "YOUR CLUB STARTS HERE" : "GOOD TO SEE YOU AGAIN"}</p>
              <h2>{isSignUp ? "Create your account" : "Welcome back"}</h2>
              <p>
                {isSignUp
                  ? "Set up your club profile and create a secure home for your team."
                  : "Sign in to get back to your club workspace."}
              </p>
            </div>
            {children}
          </div>

          <footer className="auth-panel-footer">
            <span>TOUCHLINE <i aria-hidden="true">/</i> CLUB OPERATIONS</span>
            <Link href="/">Explore the dashboard <ArrowUpRight aria-hidden="true" /></Link>
          </footer>
        </section>
      </div>
    </main>
  )
}
