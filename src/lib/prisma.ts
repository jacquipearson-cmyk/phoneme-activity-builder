// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  // Use an explicit union with undefined instead of the optional `?` syntax
  // which can cause the parser error in some dev bundlers.
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ?? (global.__prisma = new PrismaClient());