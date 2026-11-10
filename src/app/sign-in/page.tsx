"use client"

import * as React from "react"
import { BookMarked, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export default function SignInPage() {
  const [isPending, setIsPending] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  async function handleGitHubSignIn() {
    setErrorMessage(null)
    setIsPending(true)
    try {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/inbox",
      })
      if (error) {
        setErrorMessage(error.message ?? "Unable to sign in with GitHub.")
        setIsPending(false)
      }
    } catch {
      setErrorMessage("Unable to sign in with GitHub. Please try again.")
      setIsPending(false)
    }
  }

  return (
    <main className="flex min-h-svh flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-6 text-card-foreground shadow-xs">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookMarked className="size-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            Sign in to Personal Knowledge Inbox
          </h1>
          <p className="text-sm text-muted-foreground">
            Continue with your authorized GitHub account to access your inbox.
          </p>
        </div>

        {errorMessage ? (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 p-3 text-center text-xs text-destructive"
          >
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="button"
          className="w-full"
          disabled={isPending}
          onClick={handleGitHubSignIn}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Redirecting to GitHub...</span>
            </>
          ) : (
            <span>Continue with GitHub</span>
          )}
        </Button>
      </div>
    </main>
  )
}
