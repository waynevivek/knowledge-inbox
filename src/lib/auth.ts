import { headers } from "next/headers"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { getDb } from "@/lib/db"

export function parseAllowedEmails(
  rawAllowedEmails: string | undefined = process.env.ALLOWED_EMAILS
): Set<string> {
  if (!rawAllowedEmails) {
    return new Set()
  }

  return new Set(
    rawAllowedEmails
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0)
  )
}

export function isEmailAllowed(
  email: string | null | undefined,
  rawAllowedEmails: string | undefined = process.env.ALLOWED_EMAILS
): boolean {
  if (!email) {
    return false
  }

  const normalized = email.trim().toLowerCase()
  if (!normalized) {
    return false
  }

  const allowlist = parseAllowedEmails(rawAllowedEmails)
  return allowlist.has(normalized)
}

export async function enforceAllowedEmailOnCreate<
  T extends { email?: string | null },
>(
  user: T,
  rawAllowedEmails: string | undefined = process.env.ALLOWED_EMAILS
): Promise<{ data: T }> {
  if (!isEmailAllowed(user.email, rawAllowedEmails)) {
    throw new APIError("FORBIDDEN", {
      message: "Sign-up is restricted to allowlisted email addresses.",
    })
  }

  return { data: user }
}

type BetterAuthInstance = ReturnType<typeof createAuthInstance>

function createAuthInstance() {
  return betterAuth({
    database: prismaAdapter(getDb(), {
      provider: "postgresql",
    }),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => enforceAllowedEmailOnCreate(user),
        },
      },
    },
    plugins: [nextCookies()],
  })
}

let cachedAuth: BetterAuthInstance | undefined

export function getAuth(): BetterAuthInstance {
  if (!cachedAuth) {
    cachedAuth = createAuthInstance()
  }
  return cachedAuth
}

export const auth = new Proxy({} as BetterAuthInstance, {
  get(_target, prop, receiver) {
    const instance = getAuth()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === "function" ? value.bind(instance) : value
  },
})

export async function requireUser(requestHeaders?: Headers) {
  const resolvedHeaders = requestHeaders ?? (await headers())
  const session = await getAuth().api.getSession({
    headers: resolvedHeaders,
  })

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  return session.user
}
