import { z } from "zod"

const optionalTitleSchema = z
  .string()
  .trim()
  .max(200, "Title must be 200 characters or fewer")
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined))

const httpUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine(
    (val) => {
      try {
        new URL(val)
        return true
      } catch {
        return false
      }
    },
    { message: "Please enter a valid URL" }
  )
  .refine(
    (val) => {
      try {
        const parsed = new URL(val)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
      } catch {
        return false
      }
    },
    { message: "URL must use http:// or https://" }
  )

export const createUrlItemSchema = z.object({
  type: z.literal("URL"),
  url: httpUrlSchema,
  title: optionalTitleSchema,
})

export const createSnippetItemSchema = z.object({
  type: z.literal("SNIPPET"),
  content: z
    .string()
    .trim()
    .min(1, "Snippet content cannot be empty")
    .max(50000, "Snippet content is too long"),
  title: optionalTitleSchema,
})

export const createItemSchema = z.discriminatedUnion("type", [
  createUrlItemSchema,
  createSnippetItemSchema,
])

export type CreateUrlItemInput = z.infer<typeof createUrlItemSchema>
export type CreateSnippetItemInput = z.infer<typeof createSnippetItemSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
