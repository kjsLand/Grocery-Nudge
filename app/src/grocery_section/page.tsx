"use client";

import { useEffect, useState } from "react";
import { Plus, ShoppingBasket, Trash2, ChevronDown, ChevronRight, UserCheck } from "lucide-react";

type GroceryList = {
  id: string;
  groupId: string;
};

type GroceryItem = {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  price: number;
  isCompleted: boolean;
  addedById: string;
  assignedId: string;
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

  // Which list (if any) is expanded to show its items
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // items keyed by listId
  const [itemsByList, setItemsByList] = useState<Record<string, GroceryItem[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({});
  const [itemsError, setItemsError] = useState<Record<string, string | null>>({});

  // new-item form state, keyed by listId so each list has its own inputs
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [newItemQuantity, setNewItemQuantity] = useState<Record<string, string>>({});
  const [newItemPrice, setNewItemPrice] = useState<Record<string, string>>({});
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null);
  const [addItemError, setAddItemError] = useState<Record<string, string | null>>({});

  // Tracks which item id is currently being deleted (null = none)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deleteItemError, setDeleteItemError] = useState<Record<string, string | null>>({});

  // Assign-to form state, keyed by itemId (draft text before saving)
  const [assignDraft, setAssignDraft] = useState<Record<string, string>>({});
  // Tracks which item id currently has an assign PATCH in flight
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);
  const [assignItemError, setAssignItemError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!groupId) return;

    let cancelled = false;

    async function loadLists() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/grocery");
        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Expected JSON but got: ${text.slice(0, 100)}`);
        }
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

  async function loadItems(listId: string) {
    setItemsLoading((s) => ({ ...s, [listId]: true }));
    setItemsError((s) => ({ ...s, [listId]: null }));
    try {
      const res = await fetch(`/api/grocery/${listId}/items`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load items");
      setItemsByList((s) => ({ ...s, [listId]: data }));
    } catch (err) {
      console.error(err);
      setItemsError((s) => ({
        ...s,
        [listId]: err instanceof Error ? err.message : "Something went wrong",
      }));
    } finally {
      setItemsLoading((s) => ({ ...s, [listId]: false }));
    }
  }

  function toggleExpanded(listId: string) {
    const next = expandedId === listId ? null : listId;
    setExpandedId(next);
    if (next && !itemsByList[next]) {
      loadItems(next);
    }
  }

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
      if (expandedId === listId) setExpandedId(null);
    } catch (err) {
      console.error(err);
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddItem(listId: string) {
    const name = (newItemName[listId] ?? "").trim();
    const quantityRaw = newItemQuantity[listId] ?? "";
    const priceRaw = (newItemPrice[listId] ?? "").trim();

    if (!name) {
      setAddItemError((s) => ({ ...s, [listId]: "Name is required" }));
      return;
    }
    const quantity = quantityRaw === "" ? 1 : Number(quantityRaw);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setAddItemError((s) => ({ ...s, [listId]: "Quantity must be a positive number" }));
      return;
    }

    // price stays a string end-to-end — only validate that, if present, it parses to a number
    let price: string | undefined = undefined;
    if (priceRaw !== "") {
      const parsed = Number(priceRaw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        setAddItemError((s) => ({ ...s, [listId]: "Price must be a valid number" }));
        return;
      }
      price = priceRaw;
    }

    setAddingItemFor(listId);
    setAddItemError((s) => ({ ...s, [listId]: null }));
    try {
      const res = await fetch(`/api/grocery/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity, ...(price !== undefined ? { price } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add item");

      // Append the new item locally instead of refetching
      setItemsByList((s) => ({
        ...s,
        [listId]: [...(s[listId] ?? []), data],
      }));
      setNewItemName((s) => ({ ...s, [listId]: "" }));
      setNewItemQuantity((s) => ({ ...s, [listId]: "" }));
      setNewItemPrice((s) => ({ ...s, [listId]: "" }));
    } catch (err) {
      console.error(err);
      setAddItemError((s) => ({
        ...s,
        [listId]: err instanceof Error ? err.message : "Something went wrong",
      }));
    } finally {
      setAddingItemFor(null);
    }
  }

  async function handleDeleteItem(listId: string, itemId: string) {
    setDeletingItemId(itemId);
    setDeleteItemError((s) => ({ ...s, [listId]: null }));
    try {
      const res = await fetch(`/api/grocery/${listId}/items/${itemId}`, {
        method: "DELETE",
      });
      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json") ? await res.json() : null;
      if (!res.ok) throw new Error(data?.error || "Failed to delete item");

      // Remove the item locally instead of refetching
      setItemsByList((s) => ({
        ...s,
        [listId]: (s[listId] ?? []).filter((i) => i.id !== itemId),
      }));
    } catch (err) {
      console.error(err);
      setDeleteItemError((s) => ({
        ...s,
        [listId]: err instanceof Error ? err.message : "Something went wrong",
      }));
    } finally {
      setDeletingItemId(null);
    }
  }

  async function handleAssignItem(listId: string, itemId: string) {
    const assignedId = (assignDraft[itemId] ?? "").trim();

    setAssigningItemId(itemId);
    setAssignItemError((s) => ({ ...s, [itemId]: null }));
    try {
      const res = await fetch(`/api/grocery/${listId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedId }),
      });
      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json") ? await res.json() : null;
      if (!res.ok) throw new Error(data?.error || "Failed to update assignment");

      // Update the item locally instead of refetching
      setItemsByList((s) => ({
        ...s,
        [listId]: (s[listId] ?? []).map((i) => (i.id === itemId ? { ...i, assignedId } : i)),
      }));
    } catch (err) {
      console.error(err);
      setAssignItemError((s) => ({
        ...s,
        [itemId]: err instanceof Error ? err.message : "Something went wrong",
      }));
    } finally {
      setAssigningItemId(null);
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
          {lists.map((l) => {
            const isExpanded = expandedId === l.id;
            const items = itemsByList[l.id] ?? [];

            return (
              <li key={l.id} className="text-sm text-[#2B2B2E]" style={{ fontFamily: "var(--font-type)" }}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpanded(l.id)}
                    className="flex flex-1 items-center gap-2 rounded-sm py-1 text-left hover:bg-[#2B2B2E]/5"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-[#8A8578]" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-[#8A8578]" />
                    )}
                    <ShoppingBasket className="h-3.5 w-3.5 text-[#8A8578]" />
                    <span>Grocery List #{l.id.slice(0, 8)}</span>
                  </button>
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
                </div>

                {isExpanded && (
                  <div className="ml-6 mt-2 mb-3 border-l border-[#2B2B2E]/10 pl-4">
                    {itemsLoading[l.id] && (
                      <p className="text-xs text-[#8A8578]">loading items…</p>
                    )}

                    {!itemsLoading[l.id] && itemsError[l.id] && (
                      <p className="text-xs text-[#B33A3A]">{itemsError[l.id]}</p>
                    )}

                    {!itemsLoading[l.id] && !itemsError[l.id] && items.length === 0 && (
                      <p className="text-xs text-[#8A8578]">No items yet.</p>
                    )}

                    {!itemsLoading[l.id] && !itemsError[l.id] && items.length > 0 && (
                      <ul className="mb-3 space-y-1">
                        {items.map((item) => (
                          <li key={item.id} className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className={item.isCompleted ? "line-through text-[#8A8578]" : ""}>
                                {item.name}
                              </span>
                              <span className="text-[#8A8578]">× {item.quantity}</span>
                              {item.price > 0 && (
                                <span className="text-[#8A8578]">${item.price}</span>
                              )}
                              <button
                                onClick={() => handleDeleteItem(l.id, item.id)}
                                disabled={deletingItemId === item.id}
                                aria-label="Delete item"
                                title="Delete item"
                                className="ml-auto flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[#B33A3A] hover:bg-[#B33A3A]/10 disabled:opacity-40"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Assign-to row */}
                            <div className="flex items-center gap-1.5 pl-0.5">
                              <UserCheck className="h-3 w-3 text-[#8A8578]" />
                              <input
                                type="text"
                                placeholder="Assign to user id"
                                value={assignDraft[item.id] ?? item.assignedId ?? ""}
                                onChange={(e) =>
                                  setAssignDraft((s) => ({ ...s, [item.id]: e.target.value }))
                                }
                                className="w-32 rounded-sm border border-[#2B2B2E]/20 bg-white px-1.5 py-0.5 text-[11px] text-[#2B2B2E] outline-none focus:border-[#2B2B2E]/50"
                              />
                              <button
                                onClick={() => handleAssignItem(l.id, item.id)}
                                disabled={assigningItemId === item.id}
                                className="rounded-sm bg-[#2B2B2E] px-1.5 py-0.5 text-[11px] text-[#FAF7ED] hover:bg-[#2B2B2E]/90 disabled:opacity-40"
                              >
                                {assigningItemId === item.id ? "assigning…" : "Assign"}
                              </button>
                            </div>
                            {assignItemError[item.id] && (
                              <p className="pl-0.5 text-[11px] text-[#B33A3A]">
                                {assignItemError[item.id]}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {deleteItemError[l.id] && (
                      <p className="mb-2 text-xs text-[#B33A3A]">{deleteItemError[l.id]}</p>
                    )}

                    {/* Add item form */}
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={newItemName[l.id] ?? ""}
                        onChange={(e) =>
                          setNewItemName((s) => ({ ...s, [l.id]: e.target.value }))
                        }
                        className="w-32 rounded-sm border border-[#2B2B2E]/20 bg-white px-2 py-1 text-xs text-[#2B2B2E] outline-none focus:border-[#2B2B2E]/50"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={newItemQuantity[l.id] ?? ""}
                        onChange={(e) =>
                          setNewItemQuantity((s) => ({ ...s, [l.id]: e.target.value }))
                        }
                        className="w-16 rounded-sm border border-[#2B2B2E]/20 bg-white px-2 py-1 text-xs text-[#2B2B2E] outline-none focus:border-[#2B2B2E]/50"
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        value={newItemPrice[l.id] ?? ""}
                        onChange={(e) =>
                          setNewItemPrice((s) => ({ ...s, [l.id]: e.target.value }))
                        }
                        className="w-20 rounded-sm border border-[#2B2B2E]/20 bg-white px-2 py-1 text-xs text-[#2B2B2E] outline-none focus:border-[#2B2B2E]/50"
                      />
                      <button
                        onClick={() => handleAddItem(l.id)}
                        disabled={addingItemFor === l.id}
                        className="flex items-center gap-1 rounded-sm bg-[#2B2B2E] px-2 py-1 text-xs text-[#FAF7ED] hover:bg-[#2B2B2E]/90 disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                        {addingItemFor === l.id ? "adding…" : "Add item"}
                      </button>
                    </div>

                    {addItemError[l.id] && (
                      <p className="mt-1 text-xs text-[#B33A3A]">{addItemError[l.id]}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}