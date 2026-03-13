"use server";

import { prisma } from "@/lib/prisma";

export async function getDefaultRootId(): Promise<string | null> {
  const row = await prisma.family_settings.findFirst();
  return row?.default_root_id ?? null;
}

export async function setDefaultRootId(
  personId: string | null,
): Promise<void> {
  const existing = await prisma.family_settings.findFirst();

  if (!existing) {
    await prisma.family_settings.create({
      data: { default_root_id: personId },
    });
  } else {
    await prisma.family_settings.update({
      where: { id: existing.id },
      data: { default_root_id: personId },
    });
  }
}
