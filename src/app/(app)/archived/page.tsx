import { Archive } from "lucide-react"

import { EmptyStatePage } from "@/components/empty-state-page"

export default function ArchivedPage() {
  return (
    <EmptyStatePage
      title="Archived"
      icon={Archive}
      emptyHeading="No archived items"
      emptyDescription="Items you have finished reading and archived for future reference will live here."
    />
  )
}
