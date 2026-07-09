"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kalam, Special_Elite, Courier_Prime } from "next/font/google";
import { Plus, Paperclip, Users, ShoppingBasket, LogIn, LogOut, Trash2, X } from "lucide-react";
import NudgeNavBar from "../components/Nav"

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

// Deterministic "handmade" tilt for the add-card only, so the grid doesn't
// feel uniform there, but the group cards themselves stay straight/readable.
function tiltFor(index: number) {
  const angles = [-2.5, 1.5, -1, 2, -3, 1, 2.5, -1.5];
  return angles[index % angles.length];
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

  // Detail panel state — exercises GET/:id and GET/:id/members
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Group | null>(null);
  const [members, setMembers] = useState<string[] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Per-action busy flags so buttons show correct state independently
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

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetail(null);
    setMembers(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const [groupRes, membersRes] = await Promise.all([
        fetch(`/api/groups/${id}`),
        fetch(`/api/groups/${id}/members`),
      ]);
      if (!groupRes.ok) throw new Error("Failed to load group");
      if (!membersRes.ok) throw new Error("Failed to load members");
      const groupData: Group = await groupRes.json();
      const membersData: string[] = await membersRes.json();
      setDetail(groupData);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
      setDetailError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedId(null);
    setDetail(null);
    setMembers(null);
    setDetailError(null);
  }

  async function handleJoin(id: string) {
    setActionBusy("join");
    setDetailError(null);
    try {
      const res = await fetch(`/api/groups/${id}/members`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to join group");
      setDetail(data);
      setMembers(data.members);
      setGroups((prev) => prev.map((g) => (g.id === id ? data : g)));
    } catch (err) {
      console.error(err);
      setDetailError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleLeave(id: string) {
    setActionBusy("leave");
    setDetailError(null);
    try {
      const res = await fetch(`/api/groups/${id}/members`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to leave group");
      setDetail(data);
      setMembers(data.members);
      setGroups((prev) => prev.map((g) => (g.id === id ? data : g)));
    } catch (err) {
      console.error(err);
      setDetailError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleDeleteGroup(id: string) {
    setActionBusy("delete");
    setDetailError(null);
    try {
      const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete group");
      setGroups((prev) => prev.filter((g) => g.id !== id));
      closeDetail();
    } catch (err) {
      console.error(err);
      setDetailError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  const joined = user
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div
      className={`${handwritten.variable} ${typewriter.variable} ${courierPrime.variable} min-h-screen`}
      style={{
        backgroundColor: "#EDE6D6",
        backgroundImage: "radial-gradient(rgba(43,43,46,0.035) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >

      <NudgeNavBar />
      {/* Site nav */}
      <header className="border-b-2 border-dashed border-[#8A8578]/40">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div
            className="flex items-center gap-2 text-2xl text-[#2B2B2E]"
            style={{ fontFamily: "var(--font-hand)" }}
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#B33A3A]" /> Nudge
          </div>
          <div
            className="hidden gap-6 text-sm text-[#8A8578] sm:flex"
            style={{ fontFamily: "var(--font-type)" }}
          >
            <button className="hover:text-[#2B2B2E]">Shared lists</button>
            <button className="hover:text-[#2B2B2E]">Events</button>
            <button className="hover:text-[#2B2B2E]">Receipts</button>
            <button className="hover:text-[#2B2B2E]">Roadmap</button>
          </div>

          {/* Account controls replace the old marketing CTA */}
          {profileStatus === "ready" && user ? (
            <div className="flex items-center gap-3">
              <span
                className="hidden text-xs text-[#8A8578] sm:inline"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-sm border-2 border-double border-[#B33A3A] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#B33A3A] transition-colors hover:bg-[#B33A3A] hover:text-[#FAF7ED] disabled:opacity-50"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {isSigningOut ? "closing…" : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="h-8 w-24 animate-pulse rounded-sm bg-[#FAF7ED]/60" />
          )}
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Profile summary card */}
        <div className="mb-12">
          {profileStatus === "loading" && (
            <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
              opening your notebook…
            </p>
          )}

          {profileStatus === "error" && (
            <div
              className="rounded-sm px-6 py-5 shadow-[3px_4px_0_rgba(43,43,46,0.08)]"
              style={{ backgroundColor: "#FAF7ED" }}
            >
              <h2
                className="text-2xl text-[#2B2B2E]"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                Something went wrong
              </h2>
              <p
                className="mt-1 mb-4 text-sm text-[#8A8578]"
                style={{ fontFamily: "var(--font-type)" }}
              >
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
        </div>

        {/* Groups header */}
        <div className="mb-10 flex items-end justify-between border-b-2 border-dashed border-[#8A8578]/40 pb-6">
          <div>
            <h1
              className="text-5xl leading-none text-[#2B2B2E]"
              style={{ fontFamily: "var(--font-hand)" }}
            >
              My Groups
            </h1>
            <p
              className="mt-2 text-sm tracking-wide text-[#8A8578]"
              style={{ fontFamily: "var(--font-type)" }}
            >
              {loading ? "loading…" : `${groups.length} group${groups.length === 1 ? "" : "s"} pinned up`}
            </p>
          </div>
          <ShoppingBasket className="mb-1 h-8 w-8 text-[#B33A3A]" strokeWidth={1.75} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-sm bg-[#FAF7ED]/60" />
            ))}

          {!loading &&
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => openDetail(group.id)}
                className="group relative rounded-sm px-5 pb-5 pt-6 text-left shadow-[3px_4px_0_rgba(43,43,46,0.08)] transition-transform hover:-translate-y-1 hover:shadow-[4px_6px_0_rgba(43,43,46,0.12)]"
                style={{
                  backgroundColor: "#FAF7ED",
                  clipPath:
                    "polygon(0% 0%, 100% 0%, 100% 97%, 96% 100%, 90% 97%, 84% 100%, 78% 97%, 72% 100%, 66% 97%, 60% 100%, 54% 97%, 48% 100%, 42% 97%, 36% 100%, 30% 97%, 24% 100%, 18% 97%, 12% 100%, 6% 97%, 0% 100%)",
                }}
              >
                {/* paperclip */}
                <Paperclip
                  className="absolute -top-3 left-4 h-7 w-7 -rotate-12 text-[#8A8578]"
                  strokeWidth={1.5}
                />

                <h2
                  className="pr-6 text-3xl leading-tight text-[#2B2B2E]"
                  style={{ fontFamily: "var(--font-hand)" }}
                >
                  {group.title}
                </h2>

                <div
                  className="mt-3 flex items-center gap-1.5 text-xs text-[#8A8578]"
                  style={{ fontFamily: "var(--font-type)" }}
                >
                  <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {group.members.length} member{group.members.length === 1 ? "" : "s"}
                </div>
              </button>
            ))}

          {/* Add new group card */}
          {!loading && (
            <div
              className="flex min-h-[9.5rem] items-center justify-center rounded-sm border-2 border-dashed border-[#8A8578]/50 px-5 py-6 transition-colors hover:border-[#B33A3A] hover:bg-[#FAF7ED]/40"
              style={{ transform: `rotate(${tiltFor(groups.length)}deg)` }}
            >
              {isAdding ? (
                <div className="flex w-full flex-col items-stretch gap-3">
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
                    className="rounded-sm border border-[#8A8578]/40 bg-[#FAF7ED] px-3 py-2 text-lg text-[#2B2B2E] outline-none placeholder:text-[#8A8578]/70"
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
                  className="flex flex-col items-center gap-2 text-[#8A8578] transition-colors hover:text-[#B33A3A]"
                >
                  <Plus className="h-8 w-8" strokeWidth={1.5} />
                  <span className="text-sm" style={{ fontFamily: "var(--font-type)" }}>
                    Start a new group
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Detail panel — exercises GET/:id, GET/:id/members, POST/:id/members, DELETE/:id/members, DELETE/:id */}
        {selectedId && (
          <div
            className="mt-10 rounded-sm px-6 py-6 shadow-[3px_4px_0_rgba(43,43,46,0.08)]"
            style={{ backgroundColor: "#FAF7ED" }}
          >
            <div className="mb-4 flex items-start justify-between border-b border-dashed border-[#8A8578]/40 pb-4">
              <div>
                <p
                  className="text-xs uppercase tracking-wide text-[#8A8578]"
                  style={{ fontFamily: "var(--font-type)" }}
                >
                  Group details
                </p>
                <h3
                  className="text-3xl text-[#2B2B2E]"
                  style={{ fontFamily: "var(--font-hand)" }}
                >
                  {detail?.title ?? "…"}
                </h3>
              </div>
              <button
                onClick={closeDetail}
                aria-label="Close details"
                className="rounded-full p-1 text-[#8A8578] hover:text-[#2B2B2E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading && (
              <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
                loading…
              </p>
            )}

            {detailError && (
              <p className="mb-4 text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
                {detailError}
              </p>
            )}

            {!detailLoading && members && (
              <div className="mb-5">
                <p
                  className="mb-2 text-xs uppercase tracking-wide text-[#8A8578]"
                  style={{ fontFamily: "var(--font-type)" }}
                >
                  Members ({members.length})
                </p>
                {members.length === 0 ? (
                  <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
                    No members yet.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {members.map((m) => (
                      <li
                        key={m}
                        className="text-sm text-[#2B2B2E]"
                        style={{ fontFamily: "var(--font-type)" }}
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2" style={{ fontFamily: "var(--font-type)" }}>
              <button
                onClick={() => handleJoin(selectedId)}
                disabled={actionBusy === "join"}
                className="flex items-center gap-1.5 rounded-sm bg-[#2B2B2E] px-3 py-1.5 text-sm text-[#FAF7ED] disabled:opacity-40"
              >
                <LogIn className="h-3.5 w-3.5" />
                {actionBusy === "join" ? "joining…" : "Join"}
              </button>
              <button
                onClick={() => handleLeave(selectedId)}
                disabled={actionBusy === "leave"}
                className="flex items-center gap-1.5 rounded-sm border border-[#8A8578]/50 px-3 py-1.5 text-sm text-[#2B2B2E] disabled:opacity-40"
              >
                <LogOut className="h-3.5 w-3.5" />
                {actionBusy === "leave" ? "leaving…" : "Leave"}
              </button>
              <button
                onClick={() => handleDeleteGroup(selectedId)}
                disabled={actionBusy === "delete"}
                className="ml-auto flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm text-[#B33A3A] hover:bg-[#B33A3A]/10 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {actionBusy === "delete" ? "deleting…" : "Delete group"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}