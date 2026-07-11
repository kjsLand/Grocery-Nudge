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
      <style>{`
        .groups-header {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px dashed rgba(138, 133, 120, 0.4);
        }

        .groups-header__count {
          flex-shrink: 0;
          white-space: nowrap;
          font-size: 0.875rem;
          letter-spacing: 0.02em;
          color: #8A8578;
          font-family: var(--font-type);
        }

        .groups-header__new-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          border: 2px dashed rgba(138, 133, 120, 0.5);
          border-radius: 2px;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          color: #8A8578;
          font-family: var(--font-type);
          background: transparent;
          transition: border-color 0.15s, color 0.15s;
        }

        .groups-header__new-btn:hover {
          border-color: #B33A3A;
          color: #B33A3A;
        }

        .groups-header__form {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
        }

        .groups-header__input {
          min-width: 0;
          flex: 1 1 auto;
          width: 14rem;
          border: 1px solid rgba(138, 133, 120, 0.4);
          border-radius: 2px;
          background: #FAF7ED;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          color: #2B2B2E;
          font-family: var(--font-hand);
          outline: none;
        }

        .groups-header__create-btn,
        .groups-header__cancel-btn {
          flex-shrink: 0;
          white-space: nowrap;
          border-radius: 2px;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-family: var(--font-type);
        }

        .groups-header__create-btn {
          background: #B33A3A;
          color: #FAF7ED;
        }

        .groups-header__create-btn:disabled {
          opacity: 0.4;
        }

        .groups-header__cancel-btn {
          color: #8A8578;
          background: transparent;
        }

        .groups-header__cancel-btn:hover {
          color: #2B2B2E;
        }

        .group-row {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid rgba(138, 133, 120, 0.25);
          border-radius: 2px;
          padding: 0.75rem 1rem;
          background: #FAF7ED;
          box-shadow: 3px 4px 0 rgba(43, 43, 46, 0.06);
          cursor: pointer;
          transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
        }

        .group-row:hover {
          transform: translateY(-2px);
          border-color: rgba(138, 133, 120, 0.5);
          box-shadow: 4px 6px 0 rgba(43, 43, 46, 0.1);
        }

        .group-row__info {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: baseline;
          gap: 0.625rem;
          min-width: 0;
          flex: 1 1 auto;
        }

        .group-row__title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 1.25rem;
          line-height: 1.2;
          color: #2B2B2E;
          font-family: var(--font-hand);
        }

        .group-row__members {
          flex-shrink: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #8A8578;
          font-family: var(--font-type);
        }

        .group-row__actions {
          flex-shrink: 0;
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          gap: 0.375rem;
          font-family: var(--font-type);
        }

        .group-row__action-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          border-radius: 2px;
          padding: 0.375rem 0.625rem;
          font-size: 0.75rem;
        }

        .group-row__action-btn:disabled {
          opacity: 0.4;
        }

        .group-row__leave-btn {
          border: 1px solid rgba(138, 133, 120, 0.5);
          color: #2B2B2E;
          background: transparent;
        }

        .group-row__leave-btn:hover {
          background: rgba(138, 133, 120, 0.1);
        }

        .group-row__join-btn {
          border: none;
          color: #FAF7ED;
          background: #2B2B2E;
        }

        .group-row__join-btn:hover {
          background: rgba(43, 43, 46, 0.9);
        }

        .group-row__delete-btn {
          border: none;
          color: #B33A3A;
          background: transparent;
          padding: 0.375rem 0.5rem;
        }

        .group-row__delete-btn:hover {
          background: rgba(179, 58, 58, 0.1);
        }

        .group-row__chevron {
          margin-left: 0.25rem;
          color: #8A8578;
          transition: transform 0.15s;
        }

        .group-row:hover .group-row__chevron {
          transform: translateX(2px);
        }

        .groups-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .group-row-skeleton {
          height: 3.5rem;
          border-radius: 2px;
          border: 1px solid rgba(138, 133, 120, 0.2);
          background: rgba(250, 247, 237, 0.6);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <NudgeNavBar />

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

        {/* Groups header — count on the left, "new group" control on the right, single row */}
        <div className="groups-header">
          <p className="groups-header__count">
            {loading ? "loading…" : `${groups.length} group${groups.length === 1 ? "" : "s"} pinned up`}
          </p>

          {!loading && (
            isAdding ? (
              <div className="groups-header__form">
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
                  className="groups-header__input"
                />
                <button
                  onClick={handleCreate}
                  disabled={saving || !newTitle.trim()}
                  className="groups-header__create-btn"
                >
                  {saving ? "saving…" : "Create"}
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewTitle("");
                  }}
                  className="groups-header__cancel-btn"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAdding(true)} className="groups-header__new-btn">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                New group
              </button>
            )
          )}
        </div>

        {listError && (
          <p className="mb-4 text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
            {listError}
          </p>
        )}

        {/* List */}
        <div className="groups-list">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="group-row-skeleton" />
            ))}

          {!loading &&
            groups.map((group) => {
              const isMember = !!user && group.members.includes(user.id);
              const joinBusy = actionBusy === `${group.id}:join`;
              const leaveBusy = actionBusy === `${group.id}:leave`;
              const deleteBusy = actionBusy === `${group.id}:delete`;

              return (
                <div key={group.id} onClick={() => openGroup(group.id)} className="group-row">
                  <Paperclip className="h-5 w-5 shrink-0 -rotate-12 text-[#8A8578]" strokeWidth={1.5} />

                  <div className="group-row__info">
                    <h2 className="group-row__title">{group.title}</h2>
                    <span className="group-row__members">
                      <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {group.members.length}
                    </span>
                  </div>

                  <div className="group-row__actions">
                    {isMember ? (
                      <button
                        onClick={(e) => handleLeave(e, group.id)}
                        disabled={leaveBusy}
                        title="Leave group"
                        aria-label="Leave group"
                        className="group-row__action-btn group-row__leave-btn"
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
                        className="group-row__action-btn group-row__join-btn"
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
                      className="group-row__action-btn group-row__delete-btn"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <ChevronRight className="group-row__chevron h-4 w-4" strokeWidth={2} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}