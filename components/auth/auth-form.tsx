"use client"

import Link from "next/link"
import { useState, type MouseEvent } from "react"
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

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "sign-up"
  const [feedback, setFeedback] = useState("")

  function handlePreview(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form
    if (!form?.reportValidity()) return

    setFeedback("")

    if (isSignUp) {
      const formData = new FormData(form)
      if (formData.get("password") !== formData.get("confirmPassword")) {
        setFeedback("Those passwords do not match yet.")
        return
      }
    }

    setFeedback("This is a UI preview only. No credentials or club details were sent or saved.")
  }

  return (
    <form className="auth-form" autoComplete="on">
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
        <Button className="auth-submit-button" type="button" size="lg" onClick={handlePreview}>
          {isSignUp ? "Create club account" : "Sign in"}
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
        <p className="auth-form-disclaimer">Preview only — your details are not submitted or saved.</p>
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
