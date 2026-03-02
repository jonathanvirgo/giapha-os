import { DashboardProvider } from "@/components/DashboardContext";
import DashboardViews from "@/components/DashboardViews";
import MemberDetailModal from "@/components/MemberDetailModal";
import ViewToggle from "@/components/ViewToggle";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ view?: string; rootId?: string }>;
}

export default async function FamilyTreePage({ searchParams }: PageProps) {
  const { rootId } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  const [{ data: personsData }, { data: relsData }, { data: settingsData }] =
    await Promise.all([
      supabase
        .from("persons")
        .select("*")
        .order("birth_year", { ascending: true, nullsFirst: false }),
      supabase.from("relationships").select("*"),
      supabase
        .from("family_settings")
        .select("default_root_id")
        .limit(1)
        .single(),
    ]);

  const persons = personsData || [];
  const relationships = relsData || [];
  const savedDefaultRootId = settingsData?.default_root_id ?? null;

  return (
    <DashboardProvider>
      <ViewToggle />
      <DashboardViews
        persons={persons}
        relationships={relationships}
        canEdit={canEdit}
        savedDefaultRootId={savedDefaultRootId}
      />

      <MemberDetailModal />
    </DashboardProvider>
  );
}
