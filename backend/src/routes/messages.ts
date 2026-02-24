import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../db";
import { CreateMessageSchema } from "../types";

const messages = new Hono();

const serializeProfile = (p: {
  id: string;
  nickname: string;
  avatarColor: string;
  createdAt: Date;
  lastSeen: Date;
}) => ({
  id: p.id,
  nickname: p.nickname,
  avatarColor: p.avatarColor,
  createdAt: p.createdAt.toISOString(),
  lastSeen: p.lastSeen.toISOString(),
});

const serializeMessage = (m: {
  id: string;
  conversationId: string;
  senderId: string;
  type: string;
  text: string | null;
  mediaUrl: string | null;
  durationMs: number | null;
  createdAt: Date;
  sender: {
    id: string;
    nickname: string;
    avatarColor: string;
    createdAt: Date;
    lastSeen: Date;
  };
}) => ({
  id: m.id,
  conversationId: m.conversationId,
  senderId: m.senderId,
  type: m.type,
  text: m.text,
  mediaUrl: m.mediaUrl,
  durationMs: m.durationMs,
  createdAt: m.createdAt.toISOString(),
  sender: serializeProfile(m.sender),
});

messages.get("/:conversationId", async (c) => {
  const conversationId = c.req.param("conversationId");
  const cursor = c.req.query("cursor");
  const limit = Math.min(Number(c.req.query("limit") || 30), 100);

  const where: { conversationId: string; createdAt?: { lt: Date } } = { conversationId };
  if (cursor) where.createdAt = { lt: new Date(cursor) };

  const items = await prisma.message.findMany({
    where,
    include: { sender: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const lastItem = items[items.length - 1];
  const nextCursor = items.length === limit && lastItem ? lastItem.createdAt.toISOString() : null;

  return c.json({ data: {
    messages: items.reverse().map(serializeMessage),
    nextCursor,
  }});
});

messages.post("/", zValidator("json", CreateMessageSchema), async (c) => {
  const data = c.req.valid("json");

  const message = await prisma.message.create({
    data,
    include: { sender: true },
  });

  return c.json({ data: serializeMessage(message) }, 201);
});

messages.get("/:conversationId/poll", async (c) => {
  const conversationId = c.req.param("conversationId");
  const after = c.req.query("after");

  const where: { conversationId: string; createdAt?: { gt: Date } } = { conversationId };
  if (after) where.createdAt = { gt: new Date(after) };

  const items = await prisma.message.findMany({
    where,
    include: { sender: true },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return c.json({ data: items.map(serializeMessage) });
});

export { messages };
export default messages;
