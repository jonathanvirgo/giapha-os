"use server";

import { getUser, getProfile } from "@/utils/supabase/queries";
import {
  createEvent as dbCreateEvent,
  updateEvent as dbUpdateEvent,
  deleteEvent as dbDeleteEvent,
} from "@/lib/db/events";
import { revalidatePath } from "next/cache";

/** Create or update a custom event */
export async function saveEvent(data: {
  id?: string;
  name: string;
  content?: string | null;
  event_date: string;
  location?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    if (data.id) {
      // Update
      const { id, ...updateData } = data;
      await dbUpdateEvent(id, updateData);
    } else {
      // Create
      await dbCreateEvent({
        ...data,
        created_by: user.id,
      });
    }

    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (err) {
    console.error("Error saving event:", err);
    return { success: false, error: (err as Error).message };
  }
}

/** Delete a custom event */
export async function deleteEventAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    await dbDeleteEvent(id);
    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { success: false, error: (err as Error).message };
  }
}
