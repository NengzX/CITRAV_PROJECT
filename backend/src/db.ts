import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function initPragmas() {
  await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
  await prisma.$queryRawUnsafe("PRAGMA foreign_keys = ON;");
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  await prisma.$queryRawUnsafe("PRAGMA synchronous = NORMAL;");
}
initPragmas().catch(console.error);

export { prisma };
