"use client";

import { setDefaultRootId } from "@/app/actions/settings";
import { Person } from "@/types";
import { Pin, PinOff } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useDashboard } from "./DashboardContext";
import PersonSelector from "./PersonSelector";

export default function RootSelector({
  persons,
  currentRootId,
  savedDefaultRootId,
  canEdit = false,
}: {
  persons: Person[];
  currentRootId: string;
  savedDefaultRootId?: string | null;
  canEdit?: boolean;
}) {
  const { setRootId } = useDashboard();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [localDefaultId, setLocalDefaultId] = useState(savedDefaultRootId);

  // Sync local state when prop changes (e.g. after server component re-render)
  useEffect(() => {
    setLocalDefaultId(savedDefaultRootId ?? null);
  }, [savedDefaultRootId]);

  const isCurrentDefault = currentRootId === localDefaultId;

  const handleSetDefault = () => {
    startTransition(async () => {
      const result = await setDefaultRootId(currentRootId);
      if (result.success) {
        setLocalDefaultId(currentRootId);
        setToast("Đã đặt làm gốc mặc định!");
      } else {
        setToast(result.error || "Lỗi khi lưu");
      }
      setTimeout(() => setToast(null), 2500);
    });
  };

  const handleClearDefault = () => {
    startTransition(async () => {
      const result = await setDefaultRootId(null);
      if (result.success) {
        setLocalDefaultId(null);
        setToast("Đã bỏ gốc mặc định");
      } else {
        setToast(result.error || "Lỗi khi lưu");
      }
      setTimeout(() => setToast(null), 2500);
    });
  };

  return (
    <div className="flex items-center gap-2 relative">
      <PersonSelector
        persons={persons}
        selectedId={currentRootId}
        onSelect={(id) => {
          if (id) setRootId(id);
        }}
        placeholder="Chọn người..."
        label="Gốc hiển thị"
        className="w-full sm:w-72"
      />

      {canEdit && (
        <button
          onClick={isCurrentDefault ? handleClearDefault : handleSetDefault}
          disabled={isPending}
          title={
            isCurrentDefault
              ? "Bỏ gốc mặc định"
              : "Đặt làm gốc hiển thị mặc định"
          }
          className={`shrink-0 p-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50
            ${isCurrentDefault
              ? "bg-amber-50 border-amber-300 text-amber-600 shadow-sm hover:bg-amber-100"
              : "bg-white/60 border-stone-200/60 text-stone-400 hover:text-amber-600 hover:border-amber-300 hover:bg-white/90 hover:shadow-md"
            }`}
        >
          {isCurrentDefault ? (
            <Pin className="size-4 fill-current" />
          ) : (
            <PinOff className="size-4" />
          )}
        </button>
      )}

      {toast && (
        <div className="absolute -bottom-9 left-0 right-0 sm:left-0 sm:right-auto whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-lg bg-stone-800 text-white shadow-lg animate-fade-in z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

