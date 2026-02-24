# Social Chat App

A mobile-first social chat web app with anonymous auth, a public image feed, user profiles, and 1:1 direct messages.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui (port 8000)
- **Backend**: Bun + Hono + Prisma (SQLite) (port 3000)
- **Design**: DM Sans + Syne fonts, dark violet theme

## Features

### Anonymous Auth
- No email/password. User picks a nickname and avatar color on first load.
- A random `userId` is generated via `nanoid` and stored in `localStorage`.
- Profile is upserted in the DB on every load.

### Public Feed
- Post images with optional captions.
- Client-side image compression (max 300KB, JPEG quality scaling).
- Infinite scroll (IntersectionObserver + cursor-based pagination).
- Tap images to zoom. Delete your own posts.
- "Message" button on each post opens a DM.

### User Profiles
- Shows user's posts in a 2-column grid.
- "Chat" button opens a DM conversation.

### Direct Messages
- 1:1 DM only (conversation is unique per user pair regardless of who initiated).
- Text, image (base64 compressed), and voice note (MediaRecorder → base64) messages.
- Real-time polling every 2 seconds.
- Audio player bubble with duration display.

## Routes (Frontend)

| Route | Page |
|---|---|
| `/` | Feed |
| `/profile/:userId` | User Profile |
| `/conversations` | DM Inbox |
| `/chat/:conversationId` | DM Thread |

## API Endpoints (Backend)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/profiles` | Upsert anonymous profile |
| `GET` | `/api/profiles/:userId` | Get profile + posts |
| `PATCH` | `/api/profiles/:userId/seen` | Update last seen |
| `GET` | `/api/posts` | Feed (cursor paginated) |
| `POST` | `/api/posts` | Create post |
| `DELETE` | `/api/posts/:postId` | Delete own post |
| `POST` | `/api/conversations` | Get or create DM conversation |
| `GET` | `/api/conversations/user/:userId` | User's conversation list |
| `GET` | `/api/messages/:conversationId` | Paginated messages |
| `POST` | `/api/messages` | Send message |
| `GET` | `/api/messages/:conversationId/poll` | Poll for new messages |

## Database Schema

- `Profile`: id, nickname, avatarColor, createdAt, lastSeen
- `Post`: id, userId, imageUrl (base64 data URL), caption, createdAt
- `Conversation`: id, user1Id, user2Id (unique pair), createdAt
- `Message`: id, conversationId, senderId, type (text/image/audio), text, mediaUrl, durationMs, createdAt

## Key Files

```
webapp/src/
  lib/auth.ts         — Anonymous user ID + localStorage helpers
  lib/imageUtils.ts   — Client-side JPEG compression
  lib/api.ts          — Fetch wrapper, auto-unwraps { data: T }
  types.ts            — Frontend type definitions
  components/
    Avatar.tsx
    FeedPostCard.tsx
    PostComposer.tsx
    MessageBubble.tsx
    ChatComposer.tsx
    VoiceRecorder.tsx
    OnboardingModal.tsx
  pages/
    FeedPage.tsx
    ProfilePage.tsx
    ConversationsPage.tsx
    ChatPage.tsx

backend/src/
  db.ts               — Prisma client with WAL pragmas
  types.ts            — Zod schemas (shared contracts)
  routes/
    profiles.ts
    posts.ts
    conversations.ts
    messages.ts
```
