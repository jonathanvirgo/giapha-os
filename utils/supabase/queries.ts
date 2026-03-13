import { Profile } from "@/types";
import { getProfileById } from "@/lib/db/profiles";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { cache } from "react";

// Supabase client — still needed for Auth only
export const getSupabase = cache(async () => {
  const cookieStore = await cookies();
  return createClient(cookieStore);
});

export const getUser = cache(async () => {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getProfile = cache(async (userId?: string) => {
  let id = userId;
  if (!id) {
    const user = await getUser();
    if (!user) return null;
    id = user.id;
  }

  return getProfileById(id) as Promise<Profile | null>;
});

export const getIsAdmin = cache(async () => {
  const profile = await getProfile();
  return profile?.role === "admin";
});
