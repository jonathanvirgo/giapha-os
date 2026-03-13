"use server";

import { prisma } from "@/lib/prisma";
import { Profile, UserRole } from "@/types";

export async function getProfileById(
  userId: string,
): Promise<Profile | null> {
  const p = await prisma.profiles.findUnique({ where: { id: userId } });
  if (!p) return null;
  return {
    id: p.id,
    role: p.role as UserRole,
    is_active: p.is_active,
    created_at: p.created_at?.toISOString() ?? "",
    updated_at: p.updated_at?.toISOString() ?? "",
  };
}

export async function getProfileRole(
  userId: string,
): Promise<UserRole | null> {
  const p = await prisma.profiles.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return (p?.role as UserRole) ?? null;
}

export async function profileExists(): Promise<boolean> {
  const count = await prisma.profiles.count({ take: 1 });
  return count > 0;
}
