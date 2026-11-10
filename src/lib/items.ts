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
    create: {
      email: DEFAULT_USER_EMAIL,
      name: "Default User",
    },
  })
}

export async function listInboxItems(userId: string): Promise<Item[]> {
  const db = getDb()

  return db.item.findMany({
    where: {
      userId,
      status: ItemStatus.INBOX,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function listAllItems(userId: string): Promise<Item[]> {
  const db = getDb()

  return db.item.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function listArchivedItems(userId: string): Promise<Item[]> {
  const db = getDb()

  return db.item.findMany({
    where: {
      userId,
      status: ItemStatus.ARCHIVED,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getItemById(
  userId: string,
  itemId: string
): Promise<Item | null> {
  const db = getDb()

  return db.item.findFirst({
    where: {
      id: itemId,
      userId,
    },
  })
}

export async function createItem(
  userId: string,
  rawInput: CreateItemInput
): Promise<Item> {
  const parsed = createItemSchema.parse(rawInput)
  const db = getDb()

  if (parsed.type === "URL") {
    return db.item.create({
      data: {
        userId,
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
      userId,
      type: ItemType.SNIPPET,
      status: ItemStatus.INBOX,
      url: null,
      content: parsed.content,
      title: parsed.title ?? null,
    },
  })
}

export async function archiveItem(
  userId: string,
  itemId: string
): Promise<Item | null> {
  const db = getDb()
  const updated = await db.item.updateMany({
    where: {
      id: itemId,
      userId,
    },
    data: {
      status: ItemStatus.ARCHIVED,
    },
  })

  if (updated.count === 0) {
    return null
  }

  return getItemById(userId, itemId)
}

export async function unarchiveItem(
  userId: string,
  itemId: string
): Promise<Item | null> {
  const db = getDb()
  const updated = await db.item.updateMany({
    where: {
      id: itemId,
      userId,
    },
    data: {
      status: ItemStatus.INBOX,
    },
  })

  if (updated.count === 0) {
    return null
  }

  return getItemById(userId, itemId)
}

export async function deleteItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const db = getDb()
  const deleted = await db.item.deleteMany({
    where: {
      id: itemId,
      userId,
    },
  })

  return deleted.count > 0
}
