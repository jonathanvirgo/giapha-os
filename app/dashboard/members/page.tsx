import { DashboardProvider } from "@/components/DashboardContext";
import DashboardViews from "@/components/DashboardViews";
import MemberDetailModal from "@/components/MemberDetailModal";
import ViewToggle from "@/components/ViewToggle";
import { getProfile } from "@/utils/supabase/queries";
import { getAllPersons } from "@/lib/db/persons";
import { getAllRelationships } from "@/lib/db/relationships";
import { getDefaultRootId } from "@/lib/db/settings";
import { Person, Relationship } from "@/types";

interface PageProps {
  searchParams: Promise<{ view?: string; rootId?: string }>;
}
export default async function FamilyTreePage({ searchParams }: PageProps) {
  const { rootId } = await searchParams;

  const profile = await getProfile();
  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  const [persons, relationships, savedDefaultRootId] = await Promise.all([
    getAllPersons({ field: "birth_year", asc: true }),
    getAllRelationships(),
    getDefaultRootId(),
  ]);

  // Prepare map and roots for tree views
  const personsMap = new Map();
  persons.forEach((p: Person) => personsMap.set(p.id, p));

  const childIds = new Set(
    relationships
      .filter(
        (r: Relationship) => r.type === "biological_child" || r.type === "adopted_child",
      )
      .map((r: Relationship) => r.person_b),
  );

  let finalRootId = rootId;

  // If no rootId is provided, fallback to the earliest created person
  if (!finalRootId || !personsMap.has(finalRootId)) {
    const rootsFallback = persons.filter((p: Person) => !childIds.has(p.id));
    if (rootsFallback.length > 0) {
      finalRootId = rootsFallback[0].id;
    } else if (persons.length > 0) {
      finalRootId = persons[0].id; // ultimate fallback
    }
  }

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
