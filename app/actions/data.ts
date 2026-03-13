"use server";

import { prisma } from "@/lib/prisma";
import { Relationship } from "@/types";
import { getIsAdmin } from "@/utils/supabase/queries";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonExport {
  id: string;
  full_name: string;
  gender: "male" | "female" | "other";
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  death_year: number | null;
  death_month: number | null;
  death_day: number | null;
  is_deceased: boolean;
  is_in_law: boolean;
  birth_order: number | null;
  generation: number | null;
  other_names: string | null;
  avatar_url: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}

interface RelationshipExport {
  id?: string;
  type: string;
  person_a: string;
  person_b: string;
  created_at?: string;
  updated_at?: string;
}

interface BackupPayload {
  version: number;
  timestamp: string;
  persons: PersonExport[];
  relationships: RelationshipExport[];
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function exportData(
  exportRootId?: string,
): Promise<BackupPayload | { error: string }> {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return { error: "Từ chối truy cập. Chỉ admin mới có quyền này." };
  }

  const allPersonsRaw = await prisma.persons.findMany({
    orderBy: { created_at: "asc" },
  });

  const allRelsRaw = await prisma.relationships.findMany({
    orderBy: { created_at: "asc" },
  });

  // Convert to export format
  let exportPersons: PersonExport[] = allPersonsRaw.map((p: typeof allPersonsRaw[number]) => ({
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
    created_at: p.created_at?.toISOString(),
    updated_at: p.updated_at?.toISOString(),
  }));

  let exportRels: RelationshipExport[] = allRelsRaw.map((r: typeof allRelsRaw[number]) => ({
    id: r.id,
    type: r.type,
    person_a: r.person_a,
    person_b: r.person_b,
    created_at: r.created_at?.toISOString(),
    updated_at: r.updated_at?.toISOString(),
  }));

  // If a root person is selected, filter the export to only their subtree
  if (exportRootId && exportPersons.some((p) => p.id === exportRootId)) {
    const includedPersonIds = new Set<string>([exportRootId]);

    const findDescendants = (parentId: string) => {
      exportRels
        .filter(
          (r) =>
            (r.type === "biological_child" || r.type === "adopted_child") &&
            r.person_a === parentId,
        )
        .forEach((r) => {
          if (!includedPersonIds.has(r.person_b)) {
            includedPersonIds.add(r.person_b);
            findDescendants(r.person_b);
          }
        });
    };
    findDescendants(exportRootId);

    const descendantsArray = Array.from(includedPersonIds);
    descendantsArray.forEach((personId) => {
      exportRels
        .filter(
          (r) =>
            r.type === "marriage" &&
            (r.person_a === personId || r.person_b === personId),
        )
        .forEach((r) => {
          const spouseId = r.person_a === personId ? r.person_b : r.person_a;
          includedPersonIds.add(spouseId);
        });
    });

    exportPersons = exportPersons.filter((p) => includedPersonIds.has(p.id));
    exportRels = exportRels.filter(
      (r) =>
        includedPersonIds.has(r.person_a) && includedPersonIds.has(r.person_b),
    );
  }

  return {
    version: 2,
    timestamp: new Date().toISOString(),
    persons: exportPersons,
    relationships: exportRels,
  };
}

// ─── Import ───────────────────────────────────────────────────────────────────

export async function importData(
  importPayload:
    | BackupPayload
    | {
        persons: PersonExport[];
        relationships: Relationship[];
      },
) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return { error: "Từ chối truy cập. Chỉ admin mới có quyền này." };
  }

  if (!importPayload?.persons || !importPayload?.relationships) {
    return { error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại file JSON." };
  }

  if (importPayload.persons.length === 0) {
    return {
      error: "File backup trống — không có thành viên nào để phục hồi.",
    };
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      // 1. Delete relationships first (FK constraint)
      await tx.relationships.deleteMany();

      // 2. Delete persons
      await tx.persons.deleteMany();

      // 3. Insert persons
      const personsData = importPayload.persons.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        gender: p.gender as "male" | "female" | "other",
        birth_year: p.birth_year ?? null,
        birth_month: p.birth_month ?? null,
        birth_day: p.birth_day ?? null,
        death_year: p.death_year ?? null,
        death_month: p.death_month ?? null,
        death_day: p.death_day ?? null,
        is_deceased: p.is_deceased ?? false,
        is_in_law: p.is_in_law ?? false,
        birth_order: p.birth_order ?? null,
        generation: p.generation ?? null,
        other_names: p.other_names ?? null,
        avatar_url: p.avatar_url ?? null,
        note: p.note ?? null,
      }));

      await tx.persons.createMany({ data: personsData });

      // 4. Insert relationships
      const relsData = importPayload.relationships.map((r) => ({
        type: r.type as "marriage" | "biological_child" | "adopted_child",
        person_a: r.person_a,
        person_b: r.person_b,
      }));

      await tx.relationships.createMany({ data: relsData });
    });
  } catch (err) {
    console.error("Import error:", err);
    return { error: `Lỗi khi import: ${(err as Error).message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/data");

  return {
    success: true,
    imported: {
      persons: importPayload.persons.length,
      relationships: importPayload.relationships.length,
    },
  };
}
