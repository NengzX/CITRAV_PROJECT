import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../db";
import { CreatePostSchema } from "../types";

const posts = new Hono();

posts.get("/", async (c) => {
  const cursor = c.req.query("cursor");
  const limit = Math.min(Number(c.req.query("limit") || 20), 50);

  const where = cursor ? { createdAt: { lt: new Date(cursor) } } : {};

  const items = await prisma.post.findMany({
    where,
    include: { profile: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const lastItem = items[items.length - 1];
  const nextCursor = items.length === limit && lastItem ? lastItem.createdAt.toISOString() : null;

  return c.json({ data: {
    posts: items.map(p => ({
      id: p.id,
      userId: p.userId,
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: p.createdAt.toISOString(),
      profile: {
        id: p.profile.id,
        nickname: p.profile.nickname,
        avatarColor: p.profile.avatarColor,
        createdAt: p.profile.createdAt.toISOString(),
        lastSeen: p.profile.lastSeen.toISOString(),
      },
    })),
    nextCursor,
  }});
});

posts.post("/", zValidator("json", CreatePostSchema), async (c) => {
  const { userId, imageUrl, caption } = c.req.valid("json");

  const post = await prisma.post.create({
    data: { userId, imageUrl, caption },
    include: { profile: true },
  });

  return c.json({ data: {
    id: post.id,
    userId: post.userId,
    imageUrl: post.imageUrl,
    caption: post.caption,
    createdAt: post.createdAt.toISOString(),
    profile: {
      id: post.profile.id,
      nickname: post.profile.nickname,
      avatarColor: post.profile.avatarColor,
      createdAt: post.profile.createdAt.toISOString(),
      lastSeen: post.profile.lastSeen.toISOString(),
    },
  }}, 201);
});

posts.delete("/:postId", async (c) => {
  const postId = c.req.param("postId");
  const userId = c.req.query("userId");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return c.json({ error: { message: "Post not found" } }, 404);
  if (post.userId !== userId) return c.json({ error: { message: "Unauthorized" } }, 403);

  await prisma.post.delete({ where: { id: postId } });
  return c.body(null, 204);
});

export default posts;
