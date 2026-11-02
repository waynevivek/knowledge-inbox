"use client"

import * as React from "react"
import { Link2, Loader2, Plus } from "lucide-react"

import {
  createItemAction,
  type CaptureFormState,
} from "@/app/(app)/inbox/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const INITIAL_STATE: CaptureFormState = {
  status: "idle",
}

export function CaptureItemForm() {
  const [state, formAction, isPending] = React.useActionState(
    createItemAction,
    INITIAL_STATE
  )
  const formRef = React.useRef<HTMLFormElement>(null)

  React.useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset()
    }
  }, [state.status, state.submittedAt])

  const urlError = state.fieldErrors?.url?.[0]
  const titleError = state.fieldErrors?.title?.[0]

  return (
    <section
      aria-label="Capture item"
      className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Link2 className="size-4 text-muted-foreground" />
        <span>Save a URL to Inbox</span>
      </div>

      <form ref={formRef} action={formAction} className="space-y-3" noValidate>
        <input type="hidden" name="type" value="URL" />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="capture-url" className="text-xs font-medium">
              URL <span className="text-destructive">*</span>
            </label>
            <Input
              id="capture-url"
              name="url"
              type="url"
              placeholder="https://example.com/article"
              disabled={isPending}
              aria-invalid={Boolean(urlError)}
              aria-describedby={urlError ? "capture-url-error" : undefined}
              required
            />
            {urlError ? (
              <p id="capture-url-error" className="text-xs text-destructive">
                {urlError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="capture-title" className="text-xs font-medium">
              Title <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="capture-title"
              name="title"
              type="text"
              placeholder="Optional title"
              disabled={isPending}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "capture-title-error" : undefined}
            />
            {titleError ? (
              <p id="capture-title-error" className="text-xs text-destructive">
                {titleError}
              </p>
            ) : null}
          </div>
        </div>

        {state.status === "error" && state.message ? (
          <p role="alert" className="text-xs text-destructive">
            {state.message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>Save to Inbox</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  )
}
