import { Suspense } from "react"
import { connection } from "next/server"

import { CaptureItemForm } from "@/components/capture-item-form"
import { InboxItemList } from "@/components/inbox-item-list"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { listInboxItems } from "@/lib/items"

async function InboxItemsContent() {
  await connection()
  const items = await listInboxItems()
  return <InboxItemList items={items} />
}

function InboxItemsFallback() {
  return (
    <div className="space-y-3" aria-label="Loading inbox items">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  )
}

export default function InboxPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-semibold tracking-tight">Inbox</h1>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <CaptureItemForm />
        <Suspense fallback={<InboxItemsFallback />}>
          <InboxItemsContent />
        </Suspense>
      </main>
    </div>
  )
}
