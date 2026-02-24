import { z } from "zod";

export const UpsertProfileSchema = z.object({
  userId: z.string(),
  nickname: z.string().max(30).default("Anonymous"),
  avatarColor: z.string().default("#6366f1"),
});

export const ProfileSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  avatarColor: z.string(),
  createdAt: z.string(),
  lastSeen: z.string(),
});

export const CreatePostSchema = z.object({
  userId: z.string(),
  imageUrl: z.string(),
  caption: z.string().max(500).optional(),
});

export const PostSchema = z.object({
  id: z.string(),
  userId: z.string(),
  imageUrl: z.string(),
  caption: z.string().nullable(),
  createdAt: z.string(),
  profile: ProfileSchema,
});

export const CreateMessageSchema = z.object({
  conversationId: z.string(),
  senderId: z.string(),
  type: z.enum(["text", "image", "audio"]),
  text: z.string().max(2000).optional(),
  mediaUrl: z.string().optional(),
  durationMs: z.number().int().optional(),
});

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  type: z.string(),
  text: z.string().nullable(),
  mediaUrl: z.string().nullable(),
  durationMs: z.number().nullable(),
  createdAt: z.string(),
  sender: ProfileSchema,
});

export const ConversationSchema = z.object({
  id: z.string(),
  user1Id: z.string(),
  user2Id: z.string(),
  createdAt: z.string(),
  user1: ProfileSchema,
  user2: ProfileSchema,
});

export const ConversationWithLastMessageSchema = ConversationSchema.extend({
  messages: z.array(MessageSchema),
});

export const FeedResponseSchema = z.object({
  posts: z.array(PostSchema),
  nextCursor: z.string().nullable(),
});

export const MessagesResponseSchema = z.object({
  messages: z.array(MessageSchema),
  nextCursor: z.string().nullable(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Post = z.infer<typeof PostSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationWithLastMessage = z.infer<typeof ConversationWithLastMessageSchema>;
export type FeedResponse = z.infer<typeof FeedResponseSchema>;
export type MessagesResponse = z.infer<typeof MessagesResponseSchema>;
