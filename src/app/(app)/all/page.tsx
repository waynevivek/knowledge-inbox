import { Layers } from "lucide-react"

import { EmptyStatePage } from "@/components/empty-state-page"

export default function AllItemsPage() {
  return (
    <EmptyStatePage
      title="All Items"
      icon={Layers}
      emptyHeading="No items saved yet"
      emptyDescription="Every URL and text snippet you capture across your knowledge inbox will be listed here."
    />
  )
}
