/**
 * Database migration script for Supabase PostgreSQL.
 * If auto-connection fails, run scripts/setup.sql manually in Supabase Studio.
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:Realnrstsec2018@db.juqicmvbnylxzwiipblt.supabase.co:5432/postgres";

// Supabase Supavisor pooler URL (IPv4-compatible)
const POOLER_URL =
  "postgresql://postgres.juqicmvbnylxzwiipblt:Realnrstsec2018@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const SQL_STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
  `CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL DEFAULT 'Anonymous',
    avatar_color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'audio')),
    text TEXT,
    media_url TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC)`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id)`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id)`,
  `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE posts ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE conversations ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE messages ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'allow_all_profiles') THEN
      CREATE POLICY allow_all_profiles ON profiles USING (true) WITH CHECK (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'allow_all_posts') THEN
      CREATE POLICY allow_all_posts ON posts USING (true) WITH CHECK (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'allow_all_conversations') THEN
      CREATE POLICY allow_all_conversations ON conversations USING (true) WITH CHECK (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'allow_all_messages') THEN
      CREATE POLICY allow_all_messages ON messages USING (true) WITH CHECK (true);
    END IF;
  END $$`,
];

async function runMigration(connectionString: string, label: string): Promise<boolean> {
  console.log(`\nTrying ${label}...`);
  const sql = postgres(connectionString, {
    ssl: "require",
    max: 1,
    connect_timeout: 10,
    prepare: false,
  });

  try {
    await sql`SELECT 1`;
    console.log(`Connected via ${label}! Running migrations...`);

    for (const stmt of SQL_STATEMENTS) {
      await sql.unsafe(stmt);
      process.stdout.write(".");
    }

    console.log("\nMigration complete!");
    await sql.end();
    return true;
  } catch (e: unknown) {
    const err = e as Error;
    console.log(`${label} failed: ${err.message.slice(0, 100)}`);
    try { await sql.end(); } catch {}
    return false;
  }
}

async function main() {
  console.log("Supabase PostgreSQL Migration");
  console.log("=".repeat(40));

  const success =
    (await runMigration(DB_URL, "direct DB")) ||
    (await runMigration(POOLER_URL, "pooler"));

  if (!success) {
    console.log("\n" + "=".repeat(60));
    console.log("AUTOMATIC MIGRATION FAILED - MANUAL SETUP REQUIRED");
    console.log("=".repeat(60));
    console.log("\nRun the migration SQL manually:");
    console.log("  1. Visit: https://supabase.com/dashboard/project/juqicmvbnylxzwiipblt/sql");
    console.log("  2. Paste the contents of: backend/scripts/setup.sql");
    console.log("  3. Click Run");
    console.log("\nThe backend will work once the tables are created.");
  }
}

main().catch(console.error);
