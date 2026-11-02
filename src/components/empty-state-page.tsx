import type { LucideIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

type EmptyStatePageProps = {
  title: string
  icon: LucideIcon
  emptyHeading: string
  emptyDescription: string
}

export function EmptyStatePage({
  title,
  icon: Icon,
  emptyHeading,
  emptyDescription,
}: EmptyStatePageProps) {
  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            {emptyHeading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      </div>
    </div>
  )
}
