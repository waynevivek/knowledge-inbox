import type { Item } from "@prisma/client"
import {
  Archive,
  ExternalLink,
  FileText,
  Inbox,
  Layers,
  Link2,
  type LucideIcon,
} from "lucide-react"

import { ItemCardActions } from "@/components/item-card-actions"

export type ItemListView = "inbox" | "all" | "archived"

type InboxItemListProps = {
  items: Item[]
  view?: ItemListView
}

const EMPTY_STATE_BY_VIEW: Record<
  ItemListView,
  {
    icon: LucideIcon
    heading: string
    description: string
    listLabel: string
  }
> = {
  inbox: {
    icon: Inbox,
    heading: "Your inbox is empty",
    description:
      "Saved URLs and text snippets waiting to be triaged or read will appear here.",
    listLabel: "Inbox items",
  },
  all: {
    icon: Layers,
    heading: "No items saved yet",
    description:
      "Every URL and text snippet you capture across your knowledge inbox will be listed here.",
    listLabel: "All items",
  },
  archived: {
    icon: Archive,
    heading: "No archived items",
    description:
      "Items you have finished reading and archived for future reference will live here.",
    listLabel: "Archived items",
  },
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

export function InboxItemList({ items, view = "inbox" }: InboxItemListProps) {
  const emptyState = EMPTY_STATE_BY_VIEW[view]

  if (items.length === 0) {
    const EmptyIcon = emptyState.icon
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <EmptyIcon className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            {emptyState.heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {emptyState.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3" aria-label={emptyState.listLabel}>
      {items.map((item) => {
        const isUrl = item.type === "URL"
        const isInbox = item.status === "INBOX"
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
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold tracking-tight">
                      {heading}
                    </h3>
                    <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {isUrl ? "URL" : "Snippet"}
                    </span>
                    {view === "all" ? (
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                          isInbox
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {isInbox ? "Inbox" : "Archived"}
                      </span>
                    ) : null}
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

              <div className="flex shrink-0 flex-col items-end gap-2">
                <time
                  dateTime={new Date(item.createdAt).toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {formatDate(item.createdAt)}
                </time>

                <ItemCardActions
                  itemId={item.id}
                  itemHeading={heading}
                  status={item.status}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
