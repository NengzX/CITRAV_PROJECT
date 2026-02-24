import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../db";

const conversations = new Hono();

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

conversations.post("/", zValidator("json", z.object({ userId1: z.string(), userId2: z.string() })), async (c) => {
  const { userId1, userId2 } = c.req.valid("json");
  const [user1Id, user2Id] = [userId1, userId2].sort() as [string, string];

  const conversation = await prisma.conversation.upsert({
    where: { user1Id_user2Id: { user1Id, user2Id } },
    create: { user1Id, user2Id },
    update: {},
    include: { user1: true, user2: true },
  });

  return c.json({ data: {
    id: conversation.id,
    user1Id: conversation.user1Id,
    user2Id: conversation.user2Id,
    createdAt: conversation.createdAt.toISOString(),
    user1: serializeProfile(conversation.user1),
    user2: serializeProfile(conversation.user2),
  }});
});

conversations.get("/user/:userId", async (c) => {
  const userId = c.req.param("userId");

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      user1: true,
      user2: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ data: convs.map(conv => ({
    id: conv.id,
    user1Id: conv.user1Id,
    user2Id: conv.user2Id,
    createdAt: conv.createdAt.toISOString(),
    user1: serializeProfile(conv.user1),
    user2: serializeProfile(conv.user2),
    messages: conv.messages.map(m => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      type: m.type,
      text: m.text,
      mediaUrl: m.mediaUrl,
      durationMs: m.durationMs,
      createdAt: m.createdAt.toISOString(),
      sender: serializeProfile(m.sender),
    })),
  }))});
});

export default conversations;
