import "server-only"

import { ItemStatus, ItemType, type Item, type User } from "@prisma/client"
import { getDb } from "@/lib/db"
import {
  createItemSchema,
  type CreateItemInput,
} from "@/lib/validations/item"

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

export async function createItem(rawInput: CreateItemInput): Promise<Item> {
  const parsed = createItemSchema.parse(rawInput)
  const db = getDb()
  const user = await getDefaultUser()

  if (parsed.type === "URL") {
    return db.item.create({
      data: {
        userId: user.id,
        type: ItemType.URL,
        status: ItemStatus.INBOX,
        url: parsed.url,
        content: null,
        title: parsed.title ?? null,
      },
    })
  }

  return db.item.create({
    data: {
      userId: user.id,
      type: ItemType.SNIPPET,
      status: ItemStatus.INBOX,
      url: null,
      content: parsed.content,
      title: parsed.title ?? null,
    },
  })
}
