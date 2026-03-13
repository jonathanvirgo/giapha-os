import FamilyStats from "@/components/FamilyStats";
import { getAllPersons } from "@/lib/db/persons";
import { getAllRelationships } from "@/lib/db/relationships";

export const metadata = {
  title: "Thống kê gia phả",
};

export default async function StatsPage() {
  const [persons, relationships] = await Promise.all([
    getAllPersons(),
    getAllRelationships(),
  ]);

  return (
    <div className="flex-1 w-full relative flex flex-col pb-12">
      <div className="w-full relative z-20 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="title">Thống kê gia phả</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Tổng quan số liệu về các thành viên trong dòng họ
        </p>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <FamilyStats
          persons={persons}
          relationships={relationships}
        />
      </main>
    </div>
  );
}
