"use server";

import { getProfile } from "@/utils/supabase/queries";
import {
  getPersonById,
  getPrivateDetails,
  createPerson,
  updatePerson,
  upsertPrivateDetails,
  getAllPersons,
} from "@/lib/db/persons";
import { Person } from "@/types";
import { revalidatePath } from "next/cache";

/** Fetch all persons (for DataImportExport, etc.) */
export async function fetchAllPersons(): Promise<Person[]> {
  return getAllPersons({ field: "birth_year", asc: true });
}

/** Fetch a single person + optional private data (if admin) */
export async function fetchPerson(
  id: string,
): Promise<{
  person: Person | null;
  privateData: Record<string, unknown> | null;
  error?: string;
}> {
  try {
    const profile = await getProfile();
    const isAdmin = profile?.role === "admin";

    const person = await getPersonById(id);
    if (!person) {
      return { person: null, privateData: null, error: "Không thể tải thông tin thành viên." };
    }

    let privateData: Record<string, unknown> | null = null;
    if (isAdmin) {
      const pd = await getPrivateDetails(id);
      privateData = pd ? { ...pd } : {};
    }

    return { person, privateData };
  } catch (err) {
    console.error("Error fetching person:", err);
    return { person: null, privateData: null, error: "Đã xảy ra lỗi hệ thống." };
  }
}

/** Save (create or update) a person + private data */
export async function savePerson(data: {
  id?: string;
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
  // Private fields
  phone_number?: string | null;
  occupation?: string | null;
  current_residence?: string | null;
}): Promise<{ personId: string; error?: string }> {
  try {
    const profile = await getProfile();
    const canEdit = profile?.role === "admin" || profile?.role === "editor";

    if (!canEdit) {
      return { personId: "", error: "Không có quyền thực hiện." };
    }

    const isAdmin = profile?.role === "admin";
    const { id, phone_number, occupation, current_residence, ...personData } = data;

    let personId = id;

    if (personId) {
      // Update
      await updatePerson(personId, personData);
    } else {
      // Create
      const newPerson = await createPerson(personData);
      personId = newPerson.id;
    }

    // Upsert private data if admin
    if (isAdmin && personId) {
      await upsertPrivateDetails({
        person_id: personId,
        phone_number: phone_number ?? null,
        occupation: occupation ?? null,
        current_residence: current_residence ?? null,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/members");

    return { personId };
  } catch (err) {
    console.error("Error saving person:", err);
    return { personId: "", error: (err as Error).message || "Failed to save member" };
  }
}
