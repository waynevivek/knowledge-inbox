import { InboxItemList } from "@/components/inbox-item-list"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { listInboxItems } from "@/lib/items"

export const dynamic = "force-dynamic"

export default async function InboxPage() {
  const items = await listInboxItems()

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
        <InboxItemList items={items} />
      </main>
    </div>
  )
}
