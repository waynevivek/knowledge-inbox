import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { getDb } from "@/lib/db"
import {
  archiveItem,
  createItem,
  deleteItem,
  getItemById,
  listAllItems,
  listArchivedItems,
  listInboxItems,
  unarchiveItem,
} from "@/lib/items"
import {
  assertSafeTestDatabaseEnv,
  configureTestDatabase,
} from "@/test/db-test-harness"

describe("test database safety guard", () => {
  it("refuses to run when TEST_DATABASE_URL is missing", () => {
    expect(() =>
      assertSafeTestDatabaseEnv({
        TEST_DATABASE_URL: "",
        DATABASE_URL: "postgresql://user:pass@host/neondb",
      })
    ).toThrow(/TEST_DATABASE_URL is not set/i)
  })

  it("refuses to run when TEST_DATABASE_URL equals DATABASE_URL", () => {
    const sameUrl = "postgresql://user:pass@host/neondb?sslmode=require"
    expect(() =>
      assertSafeTestDatabaseEnv({
        TEST_DATABASE_URL: sameUrl,
        DATABASE_URL: sameUrl,
      })
    ).toThrow(/TEST_DATABASE_URL must not equal DATABASE_URL/i)
  })
})

describe("items data-access layer: two-user isolation and item lifecycle", () => {
  let userAId = ""
  let userBId = ""

  beforeAll(() => {
    configureTestDatabase()
  })

  beforeEach(async () => {
    const db = getDb()
    await db.item.deleteMany()
    await db.user.deleteMany()

    const userA = await db.user.create({
      data: { email: "user-a@example.test", name: "User A" },
    })
    const userB = await db.user.create({
      data: { email: "user-b@example.test", name: "User B" },
    })

    userAId = userA.id
    userBId = userB.id
  })

  afterAll(async () => {
    const db = getDb()
    await db.item.deleteMany()
    await db.user.deleteMany()
  })

  it("prevents User B from listing User A's inbox, archived, or all items", async () => {
    const inboxItemA = await createItem(userAId, {
      type: "URL",
      url: "https://example.com/user-a-inbox",
      title: "User A Inbox Link",
    })
    const archivedItemA = await createItem(userAId, {
      type: "SNIPPET",
      content: "User A secret snippet",
      title: "User A Archived Note",
    })
    await archiveItem(userAId, archivedItemA.id)

    const itemB = await createItem(userBId, {
      type: "URL",
      url: "https://example.com/user-b-inbox",
      title: "User B Inbox Link",
    })

    const bInbox = await listInboxItems(userBId)
    expect(bInbox.map((i) => i.id)).toEqual([itemB.id])

    const bAll = await listAllItems(userBId)
    expect(bAll.map((i) => i.id)).toEqual([itemB.id])

    const bArchived = await listArchivedItems(userBId)
    expect(bArchived).toEqual([])

    const aInbox = await listInboxItems(userAId)
    expect(aInbox.map((i) => i.id)).toEqual([inboxItemA.id])

    const aArchived = await listArchivedItems(userAId)
    expect(aArchived.map((i) => i.id)).toEqual([archivedItemA.id])

    const aAll = await listAllItems(userAId)
    expect(aAll.map((i) => i.id)).toEqual([archivedItemA.id, inboxItemA.id])
  })

  it("prevents User B from reading User A's item by ID", async () => {
    const itemA = await createItem(userAId, {
      type: "SNIPPET",
      content: "Private note belonging to User A",
      title: "Private",
    })

    const readByB = await getItemById(userBId, itemA.id)
    expect(readByB).toBeNull()

    const readByA = await getItemById(userAId, itemA.id)
    expect(readByA?.id).toBe(itemA.id)
  })

  it("prevents User B from archiving or unarchiving User A's items", async () => {
    const itemA = await createItem(userAId, {
      type: "URL",
      url: "https://example.com/a-only",
    })

    const archiveByB = await archiveItem(userBId, itemA.id)
    expect(archiveByB).toBeNull()

    const stillInboxForA = await getItemById(userAId, itemA.id)
    expect(stillInboxForA?.status).toBe("INBOX")

    const archivedByA = await archiveItem(userAId, itemA.id)
    expect(archivedByA?.status).toBe("ARCHIVED")

    const unarchiveByB = await unarchiveItem(userBId, itemA.id)
    expect(unarchiveByB).toBeNull()

    const stillArchivedForA = await getItemById(userAId, itemA.id)
    expect(stillArchivedForA?.status).toBe("ARCHIVED")

    const unarchivedByA = await unarchiveItem(userAId, itemA.id)
    expect(unarchivedByA?.status).toBe("INBOX")
  })

  it("prevents User B from deleting User A's items while allowing User A to hard-delete their own item", async () => {
    const itemA = await createItem(userAId, {
      type: "SNIPPET",
      content: "Do not let User B delete this",
    })

    const deletedByB = await deleteItem(userBId, itemA.id)
    expect(deletedByB).toBe(false)

    const stillExists = await getItemById(userAId, itemA.id)
    expect(stillExists?.id).toBe(itemA.id)

    const deletedByA = await deleteItem(userAId, itemA.id)
    expect(deletedByA).toBe(true)

    const gone = await getItemById(userAId, itemA.id)
    expect(gone).toBeNull()
  })
})
