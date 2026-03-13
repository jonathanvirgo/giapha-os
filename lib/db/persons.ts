"use server";

import { prisma } from "@/lib/prisma";
import { Person } from "@/types";

// Helper to convert Prisma person to app Person type
function toPerson(p: any): Person {
  return {
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
  };
}

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getAllPersons(orderBy?: { field: string; asc: boolean }) {
  const data = await prisma.persons.findMany({
    orderBy: orderBy
      ? { [orderBy.field]: orderBy.asc ? "asc" : "desc" }
      : { created_at: "asc" },
  });
  return data.map(toPerson);
}

export async function getPersonById(id: string): Promise<Person | null> {
  const p = await prisma.persons.findUnique({ where: { id } });
  return p ? toPerson(p) : null;
}

export async function getPrivateDetails(personId: string) {
  return prisma.person_details_private.findUnique({
    where: { person_id: personId },
  });
}

// ─── Write ───────────────────────────────────────────────────────────────────

export async function createPerson(data: {
  full_name: string;
  gender: "male" | "female" | "other";
  birth_year?: number | null;
  birth_month?: number | null;
  birth_day?: number | null;
  death_year?: number | null;
  death_month?: number | null;
  death_day?: number | null;
  is_deceased?: boolean;
  is_in_law?: boolean;
  birth_order?: number | null;
  generation?: number | null;
  other_names?: string | null;
  avatar_url?: string | null;
  note?: string | null;
}): Promise<Person> {
  const p = await prisma.persons.create({ data });
  return toPerson(p);
}

export async function updatePerson(
  id: string,
  data: {
    full_name?: string;
    gender?: "male" | "female" | "other";
    birth_year?: number | null;
    birth_month?: number | null;
    birth_day?: number | null;
    death_year?: number | null;
    death_month?: number | null;
    death_day?: number | null;
    is_deceased?: boolean;
    is_in_law?: boolean;
    birth_order?: number | null;
    generation?: number | null;
    other_names?: string | null;
    avatar_url?: string | null;
    note?: string | null;
  },
): Promise<Person> {
  const p = await prisma.persons.update({ where: { id }, data });
  return toPerson(p);
}

export async function deletePerson(id: string) {
  await prisma.persons.delete({ where: { id } });
}

export async function upsertPrivateDetails(data: {
  person_id: string;
  phone_number?: string | null;
  occupation?: string | null;
  current_residence?: string | null;
}) {
  return prisma.person_details_private.upsert({
    where: { person_id: data.person_id },
    update: {
      phone_number: data.phone_number,
      occupation: data.occupation,
      current_residence: data.current_residence,
    },
    create: data,
  });
}
