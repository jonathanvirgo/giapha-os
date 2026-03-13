"use server";

import { prisma } from "@/lib/prisma";
import { Relationship } from "@/types";

// Helper to convert Prisma relationship to app Relationship type
function toRelationship(r: any): Relationship {
  return {
    id: r.id,
    type: r.type,
    person_a: r.person_a,
    person_b: r.person_b,
    note: r.note,
    created_at: r.created_at?.toISOString() ?? "",
    updated_at: r.updated_at?.toISOString() ?? "",
  };
}

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getAllRelationships(): Promise<Relationship[]> {
  const data = await prisma.relationships.findMany({
    orderBy: { created_at: "asc" },
  });
  return data.map(toRelationship);
}

export async function getRelationshipsByPerson(
  personId: string,
): Promise<Relationship[]> {
  const data = await prisma.relationships.findMany({
    where: {
      OR: [{ person_a: personId }, { person_b: personId }],
    },
  });
  return data.map(toRelationship);
}

// ─── Write ───────────────────────────────────────────────────────────────────

export async function createRelationship(data: {
  type: "marriage" | "biological_child" | "adopted_child";
  person_a: string;
  person_b: string;
}): Promise<Relationship> {
  const r = await prisma.relationships.create({ data });
  return toRelationship(r);
}

export async function deleteRelationship(id: string) {
  await prisma.relationships.delete({ where: { id } });
}

export async function deleteRelationshipsByPerson(personId: string) {
  await prisma.relationships.deleteMany({
    where: {
      OR: [{ person_a: personId }, { person_b: personId }],
    },
  });
}

export async function hasRelationships(personId: string): Promise<boolean> {
  const count = await prisma.relationships.count({
    where: {
      OR: [{ person_a: personId }, { person_b: personId }],
    },
  });
  return count > 0;
}
