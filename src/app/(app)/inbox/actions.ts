"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import {
  archiveItem,
  createItem,
  deleteItem,
  unarchiveItem,
} from "@/lib/items"
import { createItemSchema, itemIdSchema } from "@/lib/validations/item"

export type CaptureFormState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    url?: string[]
    content?: string[]
    title?: string[]
  }
  submittedAt?: number
}

export type ItemMutationResult = {
  ok: boolean
  error?: string
}

function revalidateItemViews() {
  revalidatePath("/inbox")
  revalidatePath("/all")
  revalidatePath("/archived")
}

export async function createItemAction(
  _prevState: CaptureFormState,
  formData: FormData
): Promise<CaptureFormState> {
  let user: Awaited<ReturnType<typeof requireUser>>
  try {
    user = await requireUser()
  } catch {
    return {
      status: "error",
      message: "Unauthorized. Please sign in again.",
    }
  }

  const rawType = formData.get("type")
  const rawTitle = formData.get("title")
  const title = typeof rawTitle === "string" ? rawTitle : undefined

  const candidate =
    rawType === "SNIPPET"
      ? {
          type: "SNIPPET" as const,
          content:
            typeof formData.get("content") === "string"
              ? (formData.get("content") as string)
              : "",
          title,
        }
      : {
          type: "URL" as const,
          url:
            typeof formData.get("url") === "string"
              ? (formData.get("url") as string)
              : "",
          title,
        }

  const parsed = createItemSchema.safeParse(candidate)

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: {
        url: "url" in flattened ? flattened.url : undefined,
        content: "content" in flattened ? flattened.content : undefined,
        title: flattened.title,
      },
    }
  }

  try {
    await createItem(user.id, parsed.data)
    revalidateItemViews()
    return {
      status: "success",
      submittedAt: Date.now(),
    }
  } catch {
    return {
      status: "error",
      message: "Failed to save item. Please try again.",
    }
  }
}

async function runItemByIdMutation(
  rawItemId: string,
  mutate: (userId: string, itemId: string) => Promise<unknown>,
  failureMessage: string
): Promise<ItemMutationResult> {
  let user: Awaited<ReturnType<typeof requireUser>>
  try {
    user = await requireUser()
  } catch {
    return { ok: false, error: "Unauthorized." }
  }

  const parsed = itemIdSchema.safeParse(rawItemId)
  if (!parsed.success) {
    return { ok: false, error: "Invalid item ID." }
  }

  try {
    const outcome = await mutate(user.id, parsed.data)
    if (!outcome) {
      return { ok: false, error: "Item not found." }
    }
    revalidateItemViews()
    return { ok: true }
  } catch {
    return { ok: false, error: failureMessage }
  }
}

export async function archiveItemAction(
  rawItemId: string
): Promise<ItemMutationResult> {
  return runItemByIdMutation(
    rawItemId,
    archiveItem,
    "Failed to archive item."
  )
}

export async function unarchiveItemAction(
  rawItemId: string
): Promise<ItemMutationResult> {
  return runItemByIdMutation(
    rawItemId,
    unarchiveItem,
    "Failed to move item to inbox."
  )
}

export async function deleteItemAction(
  rawItemId: string
): Promise<ItemMutationResult> {
  return runItemByIdMutation(
    rawItemId,
    deleteItem,
    "Failed to delete item."
  )
}
