"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Kalam, Special_Elite, Courier_Prime } from "next/font/google";
import { Users, LogIn, LogOut, Trash2, ArrowLeft } from "lucide-react";
import { NudgeNavBar } from "../../components/Nav"

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
  members?: string[];
}

export default function GroupPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  // Profile state (for sign out + knowing if the current user is a member)
  const [user, setUser] = useState<UserAccount | null>(null);

  // Group state
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Action state
  const [actionBusy, setActionBusy] = useState<"join" | "leave" | "delete" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (!cancelled) router.push("/src/login");
          return;
        }
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/groups/${id}`);
        if (!res.ok) throw new Error("Failed to load group");
        const data: Group = await res.json();
        if (!cancelled) setGroup(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleJoin() {
    if (!id) return;
    setActionBusy("join");
    setActionError(null);
    try {
      const res = await fetch(`/api/groups/${id}/members`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to join group");
      setGroup(data);
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleLeave() {
    if (!id) return;
    setActionBusy("leave");
    setActionError(null);
    try {
      const res = await fetch(`/api/groups/${id}/members`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to leave group");
      setGroup(data);
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleDeleteGroup() {
    if (!id) return;
    if (!window.confirm("Delete this group? This can't be undone.")) return;
    setActionBusy("delete");
    setActionError(null);
    try {
      const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete group");
      router.push("/src/groups");
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionBusy(null);
    }
  }

  const members = group?.members ?? [];
  const isMember = !!user && members.includes(user.id);

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

      <div className="mx-auto max-w-3xl px-6 py-12">
        <button
          onClick={() => router.push("/src/groups")}
          className="mb-8 flex items-center gap-1.5 text-sm text-[#8A8578] hover:text-[#2B2B2E]"
          style={{ fontFamily: "var(--font-type)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to groups
        </button>

        {loading && (
          <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
            loading…
          </p>
        )}

        {!loading && loadError && (
          <div
            className="rounded-sm px-6 py-5 shadow-[3px_4px_0_rgba(43,43,46,0.08)]"
            style={{ backgroundColor: "#FAF7ED" }}
          >
            <h2 className="text-2xl text-[#2B2B2E]" style={{ fontFamily: "var(--font-hand)" }}>
              Couldn&apos;t find that group
            </h2>
            <p className="mt-1 text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
              {loadError}
            </p>
          </div>
        )}

        {!loading && group && (
          <>
            <div className="mb-8 flex items-end justify-between border-b-2 border-dashed border-[#8A8578]/40 pb-6">
              <h1 className="text-5xl leading-none text-[#2B2B2E]" style={{ fontFamily: "var(--font-hand)" }}>
                {group.title}
              </h1>
              <div
                className="mb-1 flex items-center gap-1.5 text-sm text-[#8A8578]"
                style={{ fontFamily: "var(--font-type)" }}
              >
                <Users className="h-4 w-4" strokeWidth={1.75} />
                {members.length} member{members.length === 1 ? "" : "s"}
              </div>
            </div>

            {actionError && (
              <p className="mb-4 text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
                {actionError}
              </p>
            )}

            {/* Actions */}
            <div className="mb-8 flex flex-wrap gap-2" style={{ fontFamily: "var(--font-type)" }}>
              {isMember ? (
                <button
                  onClick={handleLeave}
                  disabled={actionBusy === "leave"}
                  className="flex items-center gap-1.5 rounded-sm border border-[#8A8578]/50 px-3 py-1.5 text-sm text-[#2B2B2E] hover:bg-[#8A8578]/10 disabled:opacity-40"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {actionBusy === "leave" ? "leaving…" : "Leave"}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={actionBusy === "join"}
                  className="flex items-center gap-1.5 rounded-sm bg-[#2B2B2E] px-3 py-1.5 text-sm text-[#FAF7ED] hover:bg-[#2B2B2E]/90 disabled:opacity-40"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {actionBusy === "join" ? "joining…" : "Join"}
                </button>
              )}

              <button
                onClick={handleDeleteGroup}
                disabled={actionBusy === "delete"}
                className="ml-auto flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm text-[#B33A3A] hover:bg-[#B33A3A]/10 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {actionBusy === "delete" ? "deleting…" : "Delete group"}
              </button>
            </div>

            {/* Members */}
            <div
              className="rounded-sm px-6 py-5 shadow-[3px_4px_0_rgba(43,43,46,0.08)]"
              style={{ backgroundColor: "#FAF7ED" }}
            >
              <p
                className="mb-3 text-xs uppercase tracking-wide text-[#8A8578]"
                style={{ fontFamily: "var(--font-type)" }}
              >
                Members
              </p>
              {members.length === 0 ? (
                <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
                  No members yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {members.map((m) => (
                    <li key={m} className="text-sm text-[#2B2B2E]" style={{ fontFamily: "var(--font-type)" }}>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}