import { describe, expect, it } from "vitest"
import { createItemSchema, itemIdSchema } from "@/lib/validations/item"

describe("createItemSchema discriminated union", () => {
  describe("URL branch", () => {
    it("accepts valid https and http URLs with optional title", () => {
      const httpsResult = createItemSchema.safeParse({
        type: "URL",
        url: "  https://nextjs.org/docs  ",
        title: "  Next.js Docs  ",
      })
      expect(httpsResult.success).toBe(true)
      if (httpsResult.success && httpsResult.data.type === "URL") {
        expect(httpsResult.data.url).toBe("https://nextjs.org/docs")
        expect(httpsResult.data.title).toBe("Next.js Docs")
      }

      const httpResult = createItemSchema.safeParse({
        type: "URL",
        url: "http://example.com/article",
        title: "   ",
      })
      expect(httpResult.success).toBe(true)
      if (httpResult.success && httpResult.data.type === "URL") {
        expect(httpResult.data.url).toBe("http://example.com/article")
        expect(httpResult.data.title).toBeUndefined()
      }
    })

    it("rejects javascript: scheme URLs", () => {
      const result = createItemSchema.safeParse({
        type: "URL",
        url: "javascript:alert(document.cookie)",
      })
      expect(result.success).toBe(false)
    })

    it("rejects other non-http(s) schemes such as data:, ftp:, and file:", () => {
      for (const badUrl of [
        "data:text/html,<script>alert(1)</script>",
        "ftp://files.example.com/archive.zip",
        "file:///etc/passwd",
        "mailto:user@example.com",
      ]) {
        const result = createItemSchema.safeParse({
          type: "URL",
          url: badUrl,
        })
        expect(result.success).toBe(false)
      }
    })

    it("rejects empty, whitespace-only, and malformed URLs", () => {
      for (const invalid of ["", "   ", "not-a-url", "://missing-scheme.com"]) {
        const result = createItemSchema.safeParse({
          type: "URL",
          url: invalid,
        })
        expect(result.success).toBe(false)
      }
    })
  })

  describe("SNIPPET branch", () => {
    it("accepts non-empty single-line and multi-line text snippets", () => {
      const result = createItemSchema.safeParse({
        type: "SNIPPET",
        content: "  Line 1\nLine 2: key takeaway  ",
        title: "Architecture note",
      })
      expect(result.success).toBe(true)
      if (result.success && result.data.type === "SNIPPET") {
        expect(result.data.content).toBe("Line 1\nLine 2: key takeaway")
        expect(result.data.title).toBe("Architecture note")
      }
    })

    it("rejects empty or whitespace-only snippet content", () => {
      for (const emptyContent of ["", "   ", "\n\t  \n"]) {
        const result = createItemSchema.safeParse({
          type: "SNIPPET",
          content: emptyContent,
        })
        expect(result.success).toBe(false)
      }
    })
  })

  describe("itemIdSchema", () => {
    it("accepts non-empty item IDs and rejects empty or whitespace strings", () => {
      expect(itemIdSchema.safeParse("cmm123456").success).toBe(true)
      expect(itemIdSchema.safeParse("").success).toBe(false)
      expect(itemIdSchema.safeParse("   ").success).toBe(false)
    })
  })
})
