import "dotenv/config"
import net from "node:net"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { resetDbForTesting } from "@/lib/db"

net.setDefaultAutoSelectFamilyAttemptTimeout(5000)
neonConfig.webSocketConstructor = ws

export function assertSafeTestDatabaseEnv(
  env: Record<string, string | undefined> = process.env
): string {
  const testUrl = env.TEST_DATABASE_URL?.trim()
  const primaryUrl = env.DATABASE_URL?.trim()

  if (!testUrl) {
    throw new Error(
      "Refusing to run database tests: TEST_DATABASE_URL is not set."
    )
  }

  if (primaryUrl && testUrl === primaryUrl) {
    throw new Error(
      "Refusing to run database tests: TEST_DATABASE_URL must not equal DATABASE_URL."
    )
  }

  return testUrl
}

export function configureTestDatabase(): string {
  const testUrl = assertSafeTestDatabaseEnv(process.env)
  process.env.DATABASE_URL = testUrl
  resetDbForTesting()
  return testUrl
}
