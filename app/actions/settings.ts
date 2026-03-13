"use server";

import { getUser } from "@/utils/supabase/queries";
import { getProfileRole } from "@/lib/db/profiles";
import {
  getDefaultRootId as dbGetDefaultRootId,
  setDefaultRootId as dbSetDefaultRootId,
} from "@/lib/db/settings";
import { revalidatePath } from "next/cache";

/**
 * Đọc default_root_id từ family_settings.
 * Trả về id hoặc null nếu chưa thiết lập.
 */
export async function getDefaultRootId(): Promise<string | null> {
  return dbGetDefaultRootId();
}

/**
 * Cập nhật default_root_id. Chỉ admin/editor mới được phép.
 */
export async function setDefaultRootId(
  personId: string | null,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();

  if (!user) {
    return { success: false, error: "Chưa đăng nhập" };
  }

  const role = await getProfileRole(user.id);

  if (role !== "admin" && role !== "editor") {
    return { success: false, error: "Không có quyền thực hiện" };
  }

  try {
    await dbSetDefaultRootId(personId);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
