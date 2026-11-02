"use client"

import * as React from "react"
import { FileText, Link2, Loader2, Plus } from "lucide-react"

import {
  createItemAction,
  type CaptureFormState,
} from "@/app/(app)/inbox/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const INITIAL_STATE: CaptureFormState = {
  status: "idle",
}

type CaptureMode = "URL" | "SNIPPET"

export function CaptureItemForm() {
  const [mode, setMode] = React.useState<CaptureMode>("URL")
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

  const urlError = mode === "URL" ? state.fieldErrors?.url?.[0] : undefined
  const contentError =
    mode === "SNIPPET" ? state.fieldErrors?.content?.[0] : undefined
  const titleError = state.fieldErrors?.title?.[0]

  return (
    <section
      aria-label="Capture item"
      className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Quick Capture</span>

        <div
          role="tablist"
          aria-label="Capture item type"
          className="inline-flex rounded-lg bg-muted p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "URL"}
            disabled={isPending}
            onClick={() => setMode("URL")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === "URL"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className="size-3.5" />
            <span>URL</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "SNIPPET"}
            disabled={isPending}
            onClick={() => setMode("SNIPPET")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === "SNIPPET"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            <span>Text Snippet</span>
          </button>
        </div>
      </div>

      <form ref={formRef} action={formAction} className="space-y-3" noValidate>
        <input type="hidden" name="type" value={mode} />

        {mode === "URL" ? (
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
                aria-describedby={
                  titleError ? "capture-title-error" : undefined
                }
              />
              {titleError ? (
                <p
                  id="capture-title-error"
                  className="text-xs text-destructive"
                >
                  {titleError}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="capture-snippet-title"
                className="text-xs font-medium"
              >
                Title <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="capture-snippet-title"
                name="title"
                type="text"
                placeholder="Optional snippet heading"
                disabled={isPending}
                aria-invalid={Boolean(titleError)}
                aria-describedby={
                  titleError ? "capture-snippet-title-error" : undefined
                }
              />
              {titleError ? (
                <p
                  id="capture-snippet-title-error"
                  className="text-xs text-destructive"
                >
                  {titleError}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="capture-content" className="text-xs font-medium">
                Snippet <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="capture-content"
                name="content"
                placeholder="Paste a quote, note, or code snippet..."
                disabled={isPending}
                aria-invalid={Boolean(contentError)}
                aria-describedby={
                  contentError ? "capture-content-error" : undefined
                }
                required
              />
              {contentError ? (
                <p
                  id="capture-content-error"
                  className="text-xs text-destructive"
                >
                  {contentError}
                </p>
              ) : null}
            </div>
          </div>
        )}

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
                <span>
                  {mode === "URL" ? "Save URL" : "Save Snippet"}
                </span>
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  )
}
