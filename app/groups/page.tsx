"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kalam, Special_Elite, Courier_Prime } from "next/font/google";
import { Plus, Paperclip, Users, ShoppingBasket, LogIn, LogOut, Trash2, ChevronRight } from "lucide-react";
import { NudgeNavBar } from "../components/Nav"

const handwritten = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-hand" });
const typewriter = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-type" });
const courierPrime = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

type UserAccount = {
  id: string;
  email: string;
  createdAt: string;
};

interface Group {
  id: string;
  title: string;
  members: string[];
}

export default function DashboardPage() {
  const router = useRouter();

  // Profile state
  const [user, setUser] = useState<UserAccount | null>(null);
  const [profileStatus, setProfileStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Per-group, per-action busy flag so only the row/button clicked shows a spinner state
  // key: `${groupId}:${action}`
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  // The white page background was leaking around the paper texture on
  // scroll/overscroll — force the underlying document to match.
  useEffect(() => {
    document.body.style.backgroundColor = "#EDE6D6";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (!cancelled) router.push("/login");
          return;
        }
        const data = await response.json();
        if (!cancelled) {
          setUser(data);
          setProfileStatus("ready");
        }
      } catch {
        if (!cancelled) setProfileStatus("error");
      }
    }
    loadUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    async function loadGroups() {
      try {
        const res = await fetch("/api/groups/mine");
        if (!res.ok) throw new Error("Failed to load groups");
        const data: Group[] = await res.json();
        if (!cancelled) setGroups(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadGroups();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  async function handleCreate() {
    const title = newTitle.trim();
    if (!title) return;
    setSaving(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create group");
      const created: Group = await res.json();
      setGroups((prev) => [created, ...prev]);
      setNewTitle("");
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function openGroup(id: string) {
    router.push(`/groups/${id}`);
  }

  async function handleJoin(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const key = `${id}:join`;
    setActionBusy(key);
    setListError(null);
    try {
      const res = await fetch(`/api/groups/${id}/members`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to join group");
      setGroups((prev) => prev.map((g) => (g.id === id ? data : g)));
    } catch (err) {
      console.error(err);
      setListError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleLeave(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const key = `${id}:leave`;
    setActionBusy(key);
    setListError(null);
    try {
      const res = await fetch(`/api/groups/${id}/members`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to leave group");
      setGroups((prev) => prev.map((g) => (g.id === id ? data : g)));
    } catch (err) {
      console.error(err);
      setListError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleDeleteGroup(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!window.confirm("Delete this group? This can't be undone.")) return;
    const key = `${id}:delete`;
    setActionBusy(key);
    setListError(null);
    try {
      const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete group");
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
      setListError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  return (
    <div
      className={`${handwritten.variable} ${typewriter.variable} ${courierPrime.variable} min-h-screen`}
      style={{
        backgroundColor: "#EDE6D6",
        backgroundImage: "radial-gradient(rgba(43,43,46,0.035) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >
      <div>
        <NudgeNavBar />
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-sm border-2 border-double border-[#B33A3A] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#B33A3A] transition-colors hover:bg-[#B33A3A] hover:text-[#FAF7ED] disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {isSigningOut ? "closing…" : "Sign out"}
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Profile status */}
        {profileStatus === "loading" && (
          <p className="mb-8 text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
            opening your notebook…
          </p>
        )}

        {profileStatus === "error" && (
          <div
            className="mb-8 rounded-sm px-6 py-5 shadow-[3px_4px_0_rgba(43,43,46,0.08)]"
            style={{ backgroundColor: "#FAF7ED" }}
          >
            <h2 className="text-2xl text-[#2B2B2E]" style={{ fontFamily: "var(--font-hand)" }}>
              Something went wrong
            </h2>
            <p className="mt-1 mb-4 text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
              Couldn&apos;t reach the server just now.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-sm border-2 border-double border-[#B33A3A] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#B33A3A] transition-colors hover:bg-[#B33A3A] hover:text-[#FAF7ED]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Groups header */}
        <div className="mb-8 flex items-end justify-between border-b-2 border-dashed border-[#8A8578]/40 pb-6">
          <div>
            <h1 className="text-5xl leading-none text-[#2B2B2E]" style={{ fontFamily: "var(--font-hand)" }}>
              My Groups
            </h1>
            <p className="mt-2 text-sm tracking-wide text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
              {loading ? "loading…" : `${groups.length} group${groups.length === 1 ? "" : "s"} pinned up`}
            </p>
          </div>
          <ShoppingBasket className="mb-1 h-8 w-8 text-[#B33A3A]" strokeWidth={1.75} />
        </div>

        {listError && (
          <p className="mb-4 text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
            {listError}
          </p>
        )}

        {/* List */}
        <div className="flex flex-col gap-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-sm bg-[#FAF7ED]/60" />
            ))}

          {!loading &&
            groups.map((group) => {
              const isMember = !!user && group.members.includes(user.id);
              const joinBusy = actionBusy === `${group.id}:join`;
              const leaveBusy = actionBusy === `${group.id}:leave`;
              const deleteBusy = actionBusy === `${group.id}:delete`;

              return (
                <div
                  key={group.id}
                  onClick={() => openGroup(group.id)}
                  className="group relative flex cursor-pointer items-center gap-4 rounded-sm px-5 py-4 shadow-[3px_4px_0_rgba(43,43,46,0.08)] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_6px_0_rgba(43,43,46,0.12)]"
                  style={{ backgroundColor: "#FAF7ED" }}
                >
                  <Paperclip
                    className="h-6 w-6 shrink-0 -rotate-12 text-[#8A8578]"
                    strokeWidth={1.5}
                  />

                  <div className="min-w-0 flex-1">
                    <h2
                      className="truncate text-2xl leading-tight text-[#2B2B2E]"
                      style={{ fontFamily: "var(--font-hand)" }}
                    >
                      {group.title}
                    </h2>
                    <div
                      className="mt-1 flex items-center gap-1.5 text-xs text-[#8A8578]"
                      style={{ fontFamily: "var(--font-type)" }}
                    >
                      <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {group.members.length} member{group.members.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  {/* Quick actions — always visible, no need to open a panel first */}
                  <div className="flex shrink-0 items-center gap-1.5" style={{ fontFamily: "var(--font-type)" }}>
                    {isMember ? (
                      <button
                        onClick={(e) => handleLeave(e, group.id)}
                        disabled={leaveBusy}
                        title="Leave group"
                        aria-label="Leave group"
                        className="flex items-center gap-1 rounded-sm border border-[#8A8578]/50 px-2.5 py-1.5 text-xs text-[#2B2B2E] hover:bg-[#8A8578]/10 disabled:opacity-40"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        {leaveBusy ? "…" : "Leave"}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleJoin(e, group.id)}
                        disabled={joinBusy}
                        title="Join group"
                        aria-label="Join group"
                        className="flex items-center gap-1 rounded-sm bg-[#2B2B2E] px-2.5 py-1.5 text-xs text-[#FAF7ED] hover:bg-[#2B2B2E]/90 disabled:opacity-40"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        {joinBusy ? "…" : "Join"}
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteGroup(e, group.id)}
                      disabled={deleteBusy}
                      title="Delete group"
                      aria-label="Delete group"
                      className="flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs text-[#B33A3A] hover:bg-[#B33A3A]/10 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <ChevronRight
                      className="ml-1 h-4 w-4 text-[#8A8578] transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              );
            })}

          {/* Add new group row */}
          {!loading && (
            <div className="rounded-sm border-2 border-dashed border-[#8A8578]/50 px-5 py-4 transition-colors hover:border-[#B33A3A] hover:bg-[#FAF7ED]/40">
              {isAdding ? (
                <div className="flex items-center gap-3">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") {
                        setIsAdding(false);
                        setNewTitle("");
                      }
                    }}
                    placeholder="Name this group…"
                    className="flex-1 rounded-sm border border-[#8A8578]/40 bg-[#FAF7ED] px-3 py-2 text-lg text-[#2B2B2E] outline-none placeholder:text-[#8A8578]/70"
                    style={{ fontFamily: "var(--font-hand)" }}
                  />
                  <div className="flex gap-2 text-xs" style={{ fontFamily: "var(--font-type)" }}>
                    <button
                      onClick={handleCreate}
                      disabled={saving || !newTitle.trim()}
                      className="rounded-sm bg-[#B33A3A] px-3 py-1.5 text-[#FAF7ED] disabled:opacity-40"
                    >
                      {saving ? "saving…" : "Create"}
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNewTitle("");
                      }}
                      className="rounded-sm px-3 py-1.5 text-[#8A8578] hover:text-[#2B2B2E]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex w-full items-center justify-center gap-2 text-[#8A8578] transition-colors hover:text-[#B33A3A]"
                >
                  <Plus className="h-6 w-6" strokeWidth={1.5} />
                  <span className="text-sm" style={{ fontFamily: "var(--font-type)" }}>
                    Start a new group
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}