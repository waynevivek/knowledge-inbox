"use client"

import * as React from "react"
import type { ItemStatus } from "@prisma/client"
import { Archive, ArchiveRestore, Loader2, Trash2 } from "lucide-react"

import {
  archiveItemAction,
  deleteItemAction,
  unarchiveItemAction,
} from "@/app/(app)/inbox/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type ItemCardActionsProps = {
  itemId: string
  itemHeading: string
  status: ItemStatus
}

export function ItemCardActions({
  itemId,
  itemHeading,
  status,
}: ItemCardActionsProps) {
  const [isToggling, startToggleTransition] = React.useTransition()
  const [isDeleting, startDeleteTransition] = React.useTransition()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const isBusy = isToggling || isDeleting
  const isInbox = status === "INBOX"

  function handleToggleStatus() {
    setErrorMessage(null)
    startToggleTransition(async () => {
      const result = isInbox
        ? await archiveItemAction(itemId)
        : await unarchiveItemAction(itemId)

      if (!result.ok) {
        setErrorMessage(result.error ?? "Action failed.")
      }
    })
  }

  function handleConfirmDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setErrorMessage(null)
    startDeleteTransition(async () => {
      const result = await deleteItemAction(itemId)
      if (result.ok) {
        setDeleteDialogOpen(false)
      } else {
        setErrorMessage(result.error ?? "Failed to delete item.")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={isBusy}
          onClick={handleToggleStatus}
          aria-label={isInbox ? `Archive ${itemHeading}` : `Move ${itemHeading} to Inbox`}
        >
          {isToggling ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : isInbox ? (
            <Archive className="size-3.5" />
          ) : (
            <ArchiveRestore className="size-3.5" />
          )}
          <span>{isInbox ? "Archive" : "Move to Inbox"}</span>
        </Button>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={isBusy}
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Delete ${itemHeading}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">
                  {itemHeading}
                </span>
                . This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {errorMessage ? (
              <p role="alert" className="text-xs text-destructive">
                {errorMessage}
              </p>
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {errorMessage && !deleteDialogOpen ? (
        <p role="alert" className="text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
