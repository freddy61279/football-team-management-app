import type { Metadata } from "next"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata: Metadata = {
  title: "Sign in | Touchline",
  description: "Sign in to your Touchline club workspace.",
}

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <AuthForm mode="sign-in" />
    </AuthShell>
  )
}
