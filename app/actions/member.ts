"use server";

import { getProfile } from "@/utils/supabase/queries";
import { hasRelationships } from "@/lib/db/relationships";
import { deletePerson } from "@/lib/db/persons";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteMemberProfile(memberId: string) {
  const profile = await getProfile();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return {
      error: "Từ chối truy cập. Chỉ Admin hoặc Editor mới có quyền xoá hồ sơ.",
    };
  }

  // Check for existing relationships
  const hasRels = await hasRelationships(memberId);

  if (hasRels) {
    return {
      error:
        "Không thể xoá. Vui lòng xoá hết các mối quan hệ gia đình của người này trước.",
    };
  }

  // Delete the member
  try {
    await deletePerson(memberId);
  } catch (err) {
    console.error("Error deleting person:", err);
    return { error: "Đã xảy ra lỗi khi xoá hồ sơ." };
  }

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}
