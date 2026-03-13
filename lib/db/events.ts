"use server";

import { prisma } from "@/lib/prisma";

export interface CustomEvent {
  id: string;
  name: string;
  content: string | null;
  event_date: string;
  location: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

function toCustomEvent(e: {
  id: string;
  name: string;
  content: string | null;
  event_date: Date;
  location: string | null;
  created_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}): CustomEvent {
  return {
    id: e.id,
    name: e.name,
    content: e.content,
    event_date: e.event_date.toISOString().split("T")[0], // YYYY-MM-DD
    location: e.location,
    created_by: e.created_by,
    created_at: e.created_at?.toISOString() ?? "",
    updated_at: e.updated_at?.toISOString() ?? "",
  };
}

export async function getAllEvents(): Promise<CustomEvent[]> {
  const data = await prisma.custom_events.findMany({
    orderBy: { event_date: "asc" },
  });
  return data.map(toCustomEvent);
}

export async function createEvent(data: {
  name: string;
  content?: string | null;
  event_date: string; // YYYY-MM-DD
  location?: string | null;
  created_by?: string | null;
}): Promise<CustomEvent> {
  const e = await prisma.custom_events.create({
    data: {
      ...data,
      event_date: new Date(data.event_date),
    },
  });
  return toCustomEvent(e);
}

export async function updateEvent(
  id: string,
  data: {
    name?: string;
    content?: string | null;
    event_date?: string;
    location?: string | null;
  },
): Promise<CustomEvent> {
  const updateData: Record<string, unknown> = { ...data };
  if (data.event_date) {
    updateData.event_date = new Date(data.event_date);
  }
  const e = await prisma.custom_events.update({
    where: { id },
    data: updateData,
  });
  return toCustomEvent(e);
}

export async function deleteEvent(id: string) {
  await prisma.custom_events.delete({ where: { id } });
}
