'use server'

import { revalidatePath } from 'next/cache'

import { getProfile, getSupabase } from '@/utils/supabase/queries'
import { isUuid } from '@/utils/uuid'

/**
 * Đọc default_root_id từ family_settings.
 * Trả về id hoặc null nếu chưa thiết lập.
 */
export async function getDefaultRootId(): Promise<string | null> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('family_settings')
    .select('default_root_id')
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data?.default_root_id ?? null
}

/**
 * Cập nhật default_root_id. Chỉ admin/editor đang hoạt động mới được phép.
 */
export async function setDefaultRootId(
  personId: string | null
): Promise<{ success: boolean; error?: string }> {
  if (personId !== null && !isUuid(personId)) {
    return { success: false, error: 'ID thành viên không hợp lệ' }
  }

  const profile = await getProfile()
  if (!profile) {
    return { success: false, error: 'Chưa đăng nhập' }
  }

  if (
    !profile.is_active ||
    (profile.role !== 'admin' && profile.role !== 'editor')
  ) {
    return { success: false, error: 'Không có quyền thực hiện' }
  }

  const supabase = await getSupabase()

  // Lấy row đầu tiên (single-row table)
  const { data: settings, error: selectError } = await supabase
    .from('family_settings')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (selectError) {
    return { success: false, error: selectError.message }
  }

  if (!settings) {
    // Tạo row nếu chưa có
    const { error } = await supabase
      .from('family_settings')
      .insert({ default_root_id: personId })

    if (error) {
      return { success: false, error: error.message }
    }
  } else {
    const { error } = await supabase
      .from('family_settings')
      .update({ default_root_id: personId })
      .eq('id', settings.id)

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/members')
  return { success: true }
}
