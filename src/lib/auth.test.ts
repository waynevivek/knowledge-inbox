import { beforeAll, describe, expect, it } from "vitest"
import { configureTestDatabase } from "@/test/db-test-harness"
import {
  enforceAllowedEmailOnCreate,
  isEmailAllowed,
  parseAllowedEmails,
  requireUser,
} from "@/lib/auth"

beforeAll(() => {
  configureTestDatabase()
})

describe("ALLOWED_EMAILS allowlist and database hook", () => {
  it("parses comma-separated emails trimmed and lowercased", () => {
    const allowed = parseAllowedEmails(
      "  Alice@Example.com , bob@example.org , ,  "
    )
    expect([...allowed]).toEqual(["alice@example.com", "bob@example.org"])
  })

  it("checks whether an email is allowlisted case-insensitively", () => {
    const rawEnv = "owner@knowledge-inbox.dev,friend@example.com"
    expect(isEmailAllowed("OWNER@knowledge-inbox.dev", rawEnv)).toBe(true)
    expect(isEmailAllowed("  friend@EXAMPLE.com ", rawEnv)).toBe(true)
    expect(isEmailAllowed("stranger@example.com", rawEnv)).toBe(false)
    expect(isEmailAllowed("owner@knowledge-inbox.dev", "")).toBe(false)
  })

  it("rejects account creation in before-create hook when email is not allowlisted", async () => {
    await expect(
      enforceAllowedEmailOnCreate(
        { email: "intruder@example.com", name: "Intruder" },
        "allowed@example.com"
      )
    ).rejects.toMatchObject({
      status: "FORBIDDEN",
    })
  })

  it("permits account creation in before-create hook when email is allowlisted", async () => {
    const userPayload = { email: "Allowed@Example.com", name: "Allowed User" }
    const result = await enforceAllowedEmailOnCreate(
      userPayload,
      "allowed@example.com,other@example.com"
    )
    expect(result).toEqual({ data: userPayload })
  })
})

describe("requireUser() session helper", () => {
  it("throws Unauthorized error when no active session exists", async () => {
    await expect(requireUser(new Headers())).rejects.toThrow(/unauthorized/i)
  })
})
