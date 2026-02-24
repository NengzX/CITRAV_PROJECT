import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../db";
import { UpsertProfileSchema } from "../types";

const profiles = new Hono();

profiles.post("/", zValidator("json", UpsertProfileSchema), async (c) => {
  const { userId, nickname, avatarColor } = c.req.valid("json");

  const profile = await prisma.profile.upsert({
    where: { id: userId },
    update: { nickname, avatarColor, lastSeen: new Date() },
    create: { id: userId, nickname, avatarColor },
  });

  return c.json({ data: {
    id: profile.id,
    nickname: profile.nickname,
    avatarColor: profile.avatarColor,
    createdAt: profile.createdAt.toISOString(),
    lastSeen: profile.lastSeen.toISOString(),
  }});
});

profiles.get("/:userId", async (c) => {
  const userId = c.req.param("userId");

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    include: {
      posts: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!profile) return c.json({ error: { message: "Profile not found" } }, 404);

  return c.json({ data: {
    id: profile.id,
    nickname: profile.nickname,
    avatarColor: profile.avatarColor,
    createdAt: profile.createdAt.toISOString(),
    lastSeen: profile.lastSeen.toISOString(),
    posts: profile.posts.map(p => ({
      id: p.id,
      userId: p.userId,
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: p.createdAt.toISOString(),
    })),
  }});
});

profiles.patch("/:userId/seen", async (c) => {
  const userId = c.req.param("userId");
  await prisma.profile.update({ where: { id: userId }, data: { lastSeen: new Date() } });
  return c.body(null, 204);
});

// UPDATE profile (nickname + avatarColor)
profiles.patch("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();

  const profile = await prisma.profile.update({
    where: { id: userId },
    data: {
      nickname: body.nickname ?? undefined,
      avatarColor: body.avatarColor ?? undefined,
      lastSeen: new Date(),
    },
  });

  return c.json({ data: {
    id: profile.id,
    nickname: profile.nickname,
    avatarColor: profile.avatarColor,
    createdAt: profile.createdAt.toISOString(),
    lastSeen: profile.lastSeen.toISOString(),
  }});
});

export default profiles;
