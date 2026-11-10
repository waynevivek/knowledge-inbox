import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import { InboxItemList } from "@/components/inbox-item-list"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { requireUser } from "@/lib/auth"
import { listAllItems } from "@/lib/items"

async function AllItemsContent() {
  await connection()
  const user = await requireUser().catch(() => null)
  if (!user) {
    redirect("/sign-in")
  }
  const items = await listAllItems(user.id)
  return <InboxItemList items={items} view="all" />
}

function AllItemsFallback() {
  return (
    <div className="space-y-3" aria-label="Loading all items">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  )
}

export default function AllItemsPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-semibold tracking-tight">All Items</h1>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <Suspense fallback={<AllItemsFallback />}>
          <AllItemsContent />
        </Suspense>
      </main>
    </div>
  )
}
