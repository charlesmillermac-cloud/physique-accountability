import { cache } from "react";

import { prisma } from "@/lib/db/prisma";

const FALLBACK_USER_EMAIL = "athlete@physique.local";

export function getCurrentUserEmail() {
  return process.env.DEFAULT_APP_USER_EMAIL ?? FALLBACK_USER_EMAIL;
}

export const getCurrentUserSnapshot = cache(async () => {
  const email = getCurrentUserEmail();

  return prisma.user.findUnique({
    where: { email },
    include: {
      activeGoal: true,
    },
  });
});

export async function ensureCurrentUserShell() {
  const email = getCurrentUserEmail();

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      firstName: "Pending",
      lastName: "User",
    },
  });
}
