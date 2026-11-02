import { Inbox } from "lucide-react"

import { EmptyStatePage } from "@/components/empty-state-page"

export default function InboxPage() {
  return (
    <EmptyStatePage
      title="Inbox"
      icon={Inbox}
      emptyHeading="Your inbox is empty"
      emptyDescription="Saved URLs and text snippets waiting to be triaged or read will appear here."
    />
  )
}
