"use server"

import { revalidatePath } from "next/cache"
import {
  archiveItem,
  createItem,
  deleteItem,
  getDefaultUser,
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
    const user = await getDefaultUser()
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

export async function archiveItemAction(
  rawItemId: string
): Promise<ItemMutationResult> {
  const parsed = itemIdSchema.safeParse(rawItemId)
  if (!parsed.success) {
    return { ok: false, error: "Invalid item ID." }
  }

  try {
    const user = await getDefaultUser()
    const updated = await archiveItem(user.id, parsed.data)
    if (!updated) {
      return { ok: false, error: "Item not found." }
    }
    revalidateItemViews()
    return { ok: true }
  } catch {
    return { ok: false, error: "Failed to archive item." }
  }
}

export async function unarchiveItemAction(
  rawItemId: string
): Promise<ItemMutationResult> {
  const parsed = itemIdSchema.safeParse(rawItemId)
  if (!parsed.success) {
    return { ok: false, error: "Invalid item ID." }
  }

  try {
    const user = await getDefaultUser()
    const updated = await unarchiveItem(user.id, parsed.data)
    if (!updated) {
      return { ok: false, error: "Item not found." }
    }
    revalidateItemViews()
    return { ok: true }
  } catch {
    return { ok: false, error: "Failed to move item to inbox." }
  }
}

export async function deleteItemAction(
  rawItemId: string
): Promise<ItemMutationResult> {
  const parsed = itemIdSchema.safeParse(rawItemId)
  if (!parsed.success) {
    return { ok: false, error: "Invalid item ID." }
  }

  try {
    const user = await getDefaultUser()
    const deleted = await deleteItem(user.id, parsed.data)
    if (!deleted) {
      return { ok: false, error: "Item not found." }
    }
    revalidateItemViews()
    return { ok: true }
  } catch {
    return { ok: false, error: "Failed to delete item." }
  }
}
