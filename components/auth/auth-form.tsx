"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ClubDetailsFields } from "@/components/auth/club-details-fields"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "sign-up"
  const router = useRouter()
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const formData = new FormData(form)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    if (isSignUp && password !== formData.get("confirmPassword")) {
      setFeedback("Those passwords do not match yet.")
      return
    }

    setFeedback("")
    setIsSubmitting(true)
    const supabase = createSupabaseBrowserClient()
    if (!supabase) {
      setFeedback("Account services are temporarily unavailable. Please try again shortly.")
      setIsSubmitting(false)
      return
    }

    const result = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/`,
            data: {
              contact_name: String(formData.get("contactName") ?? "").trim(),
              club_name: String(formData.get("clubName") ?? "").trim(),
              short_name: String(formData.get("shortName") ?? "").trim(),
              city: String(formData.get("city") ?? "").trim(),
              country: String(formData.get("country") ?? "").trim(),
              competition: String(formData.get("competition") ?? "").trim(),
            },
          },
        })
      : await supabase.auth.signInWithPassword({ email, password })

    if (result.error) {
      setFeedback("We could not complete that request. Check your details and try again.")
      setIsSubmitting(false)
      return
    }

    if (isSignUp && !result.data.session) {
      setFeedback("Account created. Check your email to confirm your address, then sign in.")
      setIsSubmitting(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <form className="auth-form" autoComplete="on" onSubmit={handleSubmit}>
      {isSignUp ? (
        <div className="auth-form-sections">
          <FieldSet className="auth-field-set">
            <FieldLegend className="auth-field-legend">Club details</FieldLegend>
            <ClubDetailsFields idPrefix="signup-club" />
          </FieldSet>

          <FieldSet className="auth-field-set">
            <FieldLegend className="auth-field-legend">Account access</FieldLegend>
            <FieldGroup className="auth-fields-grid">
              <Field className="auth-field auth-field--wide">
                <FieldLabel htmlFor="signup-contact-name">Club contact name</FieldLabel>
                <Input
                  id="signup-contact-name"
                  name="contactName"
                  autoComplete="name"
                  placeholder="Your full name"
                  maxLength={120}
                  required
                />
              </Field>

              <Field className="auth-field auth-field--wide">
                <FieldLabel htmlFor="signup-email">Email address</FieldLabel>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@club.com"
                  maxLength={320}
                  required
                />
              </Field>

              <Field className="auth-field">
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <FieldDescription>Use at least 8 characters.</FieldDescription>
              </Field>

              <Field className="auth-field">
                <FieldLabel htmlFor="signup-confirm-password">Confirm password</FieldLabel>
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </div>
      ) : (
        <FieldSet className="auth-field-set">
          <FieldLegend className="auth-field-legend">Sign-in details</FieldLegend>
          <FieldGroup className="auth-fields-grid auth-fields-grid--single">
            <Field className="auth-field">
              <FieldLabel htmlFor="signin-email">Email address</FieldLabel>
              <Input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@club.com"
                maxLength={320}
                required
              />
            </Field>

            <Field className="auth-field">
              <FieldLabel htmlFor="signin-password">Password</FieldLabel>
              <Input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      )}

      {feedback ? (
        <p className="auth-form-feedback" role="status" aria-live="polite">{feedback}</p>
      ) : null}

      <div className="auth-form-actions">
        <Button className="auth-submit-button" type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Please wait…" : isSignUp ? "Create club account" : "Sign in"}
          {!isSubmitting ? <ArrowRight data-icon="inline-end" aria-hidden="true" /> : null}
        </Button>
        <p className="auth-form-disclaimer">Your account details are securely handled by Supabase.</p>
        <p className="auth-switch-row">
          {isSignUp ? "Already have an account?" : "New to Touchline?"}
          <Link href={isSignUp ? "/sign-in" : "/sign-up"}>
            {isSignUp ? "Sign in" : "Create a club account"}
          </Link>
        </p>
      </div>
    </form>
  )
}
