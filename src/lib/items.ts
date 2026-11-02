import "server-only"

import { ItemStatus, type Item, type User } from "@prisma/client"
import { getDb } from "@/lib/db"

export const DEFAULT_USER_EMAIL = "default@knowledge-inbox.local"

export async function getDefaultUser(): Promise<User> {
  const db = getDb()
  return db.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL },
  })
}

export async function listInboxItems(): Promise<Item[]> {
  const db = getDb()
  const user = await getDefaultUser()

  return db.item.findMany({
    where: {
      userId: user.id,
      status: ItemStatus.INBOX,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
