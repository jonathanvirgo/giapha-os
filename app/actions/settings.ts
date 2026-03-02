"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Đọc default_root_id từ family_settings.
 * Trả về id hoặc null nếu chưa thiết lập.
 */
export async function getDefaultRootId(): Promise<string | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data } = await supabase
        .from("family_settings")
        .select("default_root_id")
        .limit(1)
        .single();

    return data?.default_root_id ?? null;
}

/**
 * Cập nhật default_root_id. Chỉ admin/editor mới được phép.
 */
export async function setDefaultRootId(
    personId: string | null,
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Kiểm tra quyền
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Chưa đăng nhập" };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin" && profile?.role !== "editor") {
        return { success: false, error: "Không có quyền thực hiện" };
    }

    // Lấy row đầu tiên (single-row table)
    const { data: settings } = await supabase
        .from("family_settings")
        .select("id")
        .limit(1)
        .single();

    if (!settings) {
        // Tạo row nếu chưa có
        const { error } = await supabase
            .from("family_settings")
            .insert({ default_root_id: personId });

        if (error) {
            return { success: false, error: error.message };
        }
    } else {
        const { error } = await supabase
            .from("family_settings")
            .update({ default_root_id: personId })
            .eq("id", settings.id);

        if (error) {
            return { success: false, error: error.message };
        }
    }

    revalidatePath("/dashboard");
    return { success: true };
}
