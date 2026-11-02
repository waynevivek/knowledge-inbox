import type { Item } from "@prisma/client"
import { ExternalLink, FileText, Inbox, Link2 } from "lucide-react"

type InboxItemListProps = {
  items: Item[]
}

function formatHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function InboxItemList({ items }: InboxItemListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Your inbox is empty
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved URLs and text snippets waiting to be triaged or read will
            appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Inbox items">
      {items.map((item) => {
        const isUrl = item.type === "URL"
        const heading =
          item.title?.trim() ||
          (isUrl && item.url ? formatHostname(item.url) : "Untitled snippet")

        return (
          <li
            key={item.id}
            className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {isUrl ? (
                    <Link2 className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold tracking-tight">
                      {heading}
                    </h3>
                    <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {isUrl ? "URL" : "Snippet"}
                    </span>
                  </div>

                  {isUrl && item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      <span className="truncate">{item.url}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  ) : null}

                  {!isUrl && item.content ? (
                    <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                      {item.content}
                    </p>
                  ) : null}
                </div>
              </div>

              <time
                dateTime={new Date(item.createdAt).toISOString()}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {formatDate(item.createdAt)}
              </time>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
