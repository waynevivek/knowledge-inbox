"use server"

import { revalidatePath } from "next/cache"
import { createItem } from "@/lib/items"
import { createItemSchema } from "@/lib/validations/item"

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
    await createItem(parsed.data)
    revalidatePath("/inbox")
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
