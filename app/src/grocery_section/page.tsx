"use client";

import { useEffect, useState } from "react";
import { Plus, ShoppingBasket, Trash2 } from "lucide-react";

type GroceryList = {
  id: string;
  groupId: string;
};

export function GroceryListsSection({ groupId }: { groupId: string }) {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Tracks which list id is currently being deleted (null = none)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Bumped after a successful create/delete to re-trigger the fetch below
  const [listsVersion, setListsVersion] = useState(0);

  useEffect(() => {
    if (!groupId) return;

    let cancelled = false;

    async function loadLists() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/grocery");
        if (!res.ok) throw new Error("Failed to load grocery lists");
        const all: GroceryList[] = await res.json();
        // The endpoint returns lists across every group the user belongs to —
        // narrow to this group.
        const mine = all.filter((l) => l.groupId === groupId);
        if (!cancelled) setLists(mine);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLists();

    return () => {
      cancelled = true;
    };
  }, [groupId, listsVersion]);

  async function handleCreate() {
    if (!groupId) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create grocery list");
      setListsVersion((v) => v + 1);
    } catch (err) {
      console.error(err);
      setCreateError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(listId: string) {
    if (!window.confirm("Delete this grocery list? This can't be undone.")) return;
    setDeletingId(listId);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/grocery/${listId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete grocery list");
      setListsVersion((v) => v + 1);
    } catch (err) {
      console.error(err);
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      className="mt-6 rounded-sm px-6 py-5 shadow-[3px_4px_0_rgba(43,43,46,0.08)]"
      style={{ backgroundColor: "#FAF7ED" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
          Grocery lists
        </p>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-1.5 rounded-sm bg-[#2B2B2E] px-3 py-1.5 text-sm text-[#FAF7ED] hover:bg-[#2B2B2E]/90 disabled:opacity-40"
          style={{ fontFamily: "var(--font-type)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          {creating ? "creating…" : "New list"}
        </button>
      </div>

      {createError && (
        <p className="mb-3 text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
          {createError}
        </p>
      )}

      {deleteError && (
        <p className="mb-3 text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
          {deleteError}
        </p>
      )}

      {loading && (
        <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
          loading…
        </p>
      )}

      {!loading && loadError && (
        <p className="text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
          {loadError}
        </p>
      )}

      {!loading && !loadError && lists.length === 0 && (
        <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
          No grocery lists yet.
        </p>
      )}

      {!loading && !loadError && lists.length > 0 && (
        <ul className="space-y-1">
          {lists.map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-2 text-sm text-[#2B2B2E]"
              style={{ fontFamily: "var(--font-type)" }}
            >
              <ShoppingBasket className="h-3.5 w-3.5 text-[#8A8578]" />
              <span className="flex-1">Grocery List #{l.id.slice(0, 8)}</span>
              <button
                onClick={() => handleDelete(l.id)}
                disabled={deletingId === l.id}
                aria-label="Delete grocery list"
                title="Delete grocery list"
                className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-[#B33A3A] hover:bg-[#B33A3A]/10 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingId === l.id ? "deleting…" : ""}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}