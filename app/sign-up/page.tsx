import type { Metadata } from "next"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata: Metadata = {
  title: "Create your club account | Touchline",
  description: "Create a Touchline account and add your club's primary details.",
}

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <AuthForm mode="sign-up" />
    </AuthShell>
  )
}
