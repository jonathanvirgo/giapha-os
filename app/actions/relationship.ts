"use server";

import { getProfile } from "@/utils/supabase/queries";
import { prisma } from "@/lib/prisma";
import {
  getAllRelationships,
  createRelationship,
  deleteRelationship as dbDeleteRelationship,
  getRelationshipsByPerson,
} from "@/lib/db/relationships";
import { createPerson, getAllPersons, getPersonById } from "@/lib/db/persons";
import { Relationship, Person, RelationshipType } from "@/types";
import { revalidatePath } from "next/cache";

// ─── Enriched Relationship Types ──────────────────────────────────────────────

interface EnrichedRelationship {
  id: string;
  type: RelationshipType;
  direction: "parent" | "child" | "spouse" | "child_in_law";
  targetPerson: Person;
  note: string | null;
}

/** Fetch enriched relationships for a person (replaces complex Supabase JOINs) */
export async function fetchEnrichedRelationships(
  personId: string,
): Promise<{ relationships: EnrichedRelationship[]; error?: string }> {
  try {
    // Fetch all relationships where this person is involved
    const relsA = await prisma.relationships.findMany({
      where: { person_a: personId },
      include: { personB: true },
    });

    const relsB = await prisma.relationships.findMany({
      where: { person_b: personId },
      include: { personA: true },
    });

    const formattedRels: EnrichedRelationship[] = [];

    // Helper: convert Prisma person to app Person
    const toP = (p: typeof relsA[0]["personB"]): Person => ({
      id: p.id,
      full_name: p.full_name,
      gender: p.gender,
      birth_year: p.birth_year,
      birth_month: p.birth_month,
      birth_day: p.birth_day,
      death_year: p.death_year,
      death_month: p.death_month,
      death_day: p.death_day,
      is_deceased: p.is_deceased,
      is_in_law: p.is_in_law,
      birth_order: p.birth_order,
      generation: p.generation,
      other_names: p.other_names,
      avatar_url: p.avatar_url,
      note: p.note,
      created_at: p.created_at?.toISOString() ?? "",
      updated_at: p.updated_at?.toISOString() ?? "",
    });

    // Process rels where I am Person A
    relsA.forEach((r: typeof relsA[0]) => {
      let direction: "parent" | "child" | "spouse" = "spouse";
      if (r.type === "marriage") direction = "spouse";
      else if (r.type === "biological_child" || r.type === "adopted_child")
        direction = "child";

      formattedRels.push({
        id: r.id,
        type: r.type as RelationshipType,
        direction,
        targetPerson: toP(r.personB),
        note: r.note,
      });
    });

    // Process rels where I am Person B
    relsB.forEach((r: typeof relsB[0]) => {
      let direction: "parent" | "child" | "spouse" = "spouse";
      if (r.type === "marriage") direction = "spouse";
      else if (r.type === "biological_child" || r.type === "adopted_child")
        direction = "parent";

      formattedRels.push({
        id: r.id,
        type: r.type as RelationshipType,
        direction,
        targetPerson: toP(r.personA),
        note: r.note,
      });
    });

    // Fetch in-laws (spouses of children)
    const childrenIds = formattedRels
      .filter((r) => r.direction === "child")
      .map((r) => r.targetPerson.id);

    if (childrenIds.length > 0) {
      const childrenMarriages = await prisma.relationships.findMany({
        where: {
          type: "marriage",
          OR: [
            { person_a: { in: childrenIds } },
            { person_b: { in: childrenIds } },
          ],
        },
        include: { personA: true, personB: true },
      });

      childrenMarriages.forEach((m: typeof childrenMarriages[0]) => {
        const isAChild = childrenIds.includes(m.person_a);
        const childPerson = isAChild ? m.personA : m.personB;
        const spousePerson = isAChild ? m.personB : m.personA;

        if (spousePerson && childPerson) {
          let noteLabel = `Vợ/chồng của ${childPerson.full_name}`;
          if (spousePerson.gender === "female")
            noteLabel = `Con dâu (vợ của ${childPerson.full_name})`;
          if (spousePerson.gender === "male")
            noteLabel = `Con rể (chồng của ${childPerson.full_name})`;
          if (m.note) noteLabel += ` - ${m.note}`;

          formattedRels.push({
            id: m.id + "_inlaw",
            type: "marriage",
            direction: "child_in_law",
            targetPerson: toP(spousePerson),
            note: noteLabel,
          });
        }
      });
    }

    return { relationships: formattedRels };
  } catch (err) {
    console.error("Error fetching enriched relationships:", err);
    return { relationships: [], error: (err as Error).message };
  }
}

/** Search persons by name */
export async function searchPersons(
  query: string,
  excludeId: string,
): Promise<Person[]> {
  const results = await prisma.persons.findMany({
    where: {
      full_name: { contains: query, mode: "insensitive" },
      NOT: { id: excludeId },
    },
    take: 5,
  });

  return results.map((p: typeof results[number]) => ({
    id: p.id,
    full_name: p.full_name,
    gender: p.gender,
    birth_year: p.birth_year,
    birth_month: p.birth_month,
    birth_day: p.birth_day,
    death_year: p.death_year,
    death_month: p.death_month,
    death_day: p.death_day,
    is_deceased: p.is_deceased,
    is_in_law: p.is_in_law,
    birth_order: p.birth_order,
    generation: p.generation,
    other_names: p.other_names,
    avatar_url: p.avatar_url,
    note: p.note,
    created_at: p.created_at?.toISOString() ?? "",
    updated_at: p.updated_at?.toISOString() ?? "",
  }));
}

/** Get recent persons */
export async function getRecentPersons(
  excludeId: string,
  limit: number = 10,
): Promise<Person[]> {
  const results = await prisma.persons.findMany({
    where: { NOT: { id: excludeId } },
    orderBy: { created_at: "desc" },
    take: limit,
  });

  return results.map((p: typeof results[number]) => ({
    id: p.id,
    full_name: p.full_name,
    gender: p.gender,
    birth_year: p.birth_year,
    birth_month: p.birth_month,
    birth_day: p.birth_day,
    death_year: p.death_year,
    death_month: p.death_month,
    death_day: p.death_day,
    is_deceased: p.is_deceased,
    is_in_law: p.is_in_law,
    birth_order: p.birth_order,
    generation: p.generation,
    other_names: p.other_names,
    avatar_url: p.avatar_url,
    note: p.note,
    created_at: p.created_at?.toISOString() ?? "",
    updated_at: p.updated_at?.toISOString() ?? "",
  }));
}

/** Quick-add person with birth year and create relationship */
export async function quickAddPersonWithRel(data: {
  full_name: string;
  gender: "male" | "female" | "other";
  birth_year?: number;
  relationships: Array<{
    type: "marriage" | "biological_child" | "adopted_child";
    person_a: string;
    person_b: string;
    note?: string;
  }>;
}): Promise<{ personId: string; error?: string }> {
  const profile = await getProfile();
  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return { personId: "", error: "Không có quyền thực hiện." };
  }

  try {
    const newPerson = await createPerson({
      full_name: data.full_name,
      gender: data.gender,
      birth_year: data.birth_year ?? null,
    });

    for (const rel of data.relationships) {
      await createRelationship({
        type: rel.type,
        person_a: rel.person_a === "__NEW__" ? newPerson.id : rel.person_a,
        person_b: rel.person_b === "__NEW__" ? newPerson.id : rel.person_b,
      });
    }

    revalidatePath("/dashboard/members");
    return { personId: newPerson.id };
  } catch (err) {
    console.error("Error quick-adding person:", err);
    return { personId: "", error: (err as Error).message };
  }
}
export async function fetchRelationshipsForPerson(
  personId: string,
): Promise<{ relationships: Relationship[]; error?: string }> {
  try {
    const relationships = await getRelationshipsByPerson(personId);
    return { relationships };
  } catch (err) {
    console.error("Error fetching relationships:", err);
    return { relationships: [], error: (err as Error).message };
  }
}

/** Add a relationship */
export async function addRelationship(data: {
  type: "marriage" | "biological_child" | "adopted_child";
  person_a: string;
  person_b: string;
}): Promise<{ relationship?: Relationship; error?: string }> {
  const profile = await getProfile();
  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return { error: "Không có quyền thực hiện." };
  }

  try {
    const relationship = await createRelationship(data);
    revalidatePath("/dashboard/members");
    return { relationship };
  } catch (err) {
    console.error("Error adding relationship:", err);
    return { error: (err as Error).message };
  }
}

/** Delete a relationship */
export async function deleteRelationshipAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const profile = await getProfile();
  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return { success: false, error: "Không có quyền thực hiện." };
  }

  try {
    await dbDeleteRelationship(id);
    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (err) {
    console.error("Error deleting relationship:", err);
    return { success: false, error: (err as Error).message };
  }
}

/** Quick-add a new person and optionally create relationship */
export async function quickAddPerson(data: {
  full_name: string;
  gender: "male" | "female" | "other";
  relationship?: {
    type: "marriage" | "biological_child" | "adopted_child";
    person_a: string;
    person_b_is_new: boolean; // if true, new person is person_b
  };
}): Promise<{ person?: Person; error?: string }> {
  const profile = await getProfile();
  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return { error: "Không có quyền thực hiện." };
  }

  try {
    const newPerson = await createPerson({
      full_name: data.full_name,
      gender: data.gender,
    });

    if (data.relationship) {
      const rel = data.relationship;
      await createRelationship({
        type: rel.type,
        person_a: rel.person_b_is_new ? rel.person_a : newPerson.id,
        person_b: rel.person_b_is_new ? newPerson.id : rel.person_a,
      });
    }

    revalidatePath("/dashboard/members");
    return { person: newPerson };
  } catch (err) {
    console.error("Error quick-adding person:", err);
    return { error: (err as Error).message };
  }
}

/** Update birth_order for a person (used by LineageManager) */
export async function updateBirthOrder(
  personId: string,
  updates: { birth_order?: number | null; generation?: number | null },
): Promise<{ success: boolean; error?: string }> {
  const profile = await getProfile();
  if (profile?.role !== "admin") {
    return { success: false, error: "Không có quyền thực hiện." };
  }

  try {
    await prisma.persons.update({
      where: { id: personId },
      data: updates,
    });
    return { success: true };
  } catch (err) {
    console.error("Error updating birth order:", err);
    return { success: false, error: (err as Error).message };
  }
}

/** Batch update birth_order + generation for multiple persons */
export async function batchUpdateLineage(
  updates: Array<{ id: string; birth_order?: number | null; generation?: number | null }>,
): Promise<{ success: boolean; error?: string }> {
  const profile = await getProfile();
  if (profile?.role !== "admin") {
    return { success: false, error: "Không có quyền thực hiện." };
  }

  try {
    await prisma.$transaction(
      updates.map((u) =>
        prisma.persons.update({
          where: { id: u.id },
          data: {
            birth_order: u.birth_order,
            generation: u.generation,
          },
        }),
      ),
    );
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error batch updating lineage:", err);
    return { success: false, error: (err as Error).message };
  }
}
