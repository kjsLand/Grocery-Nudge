"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kalam, Special_Elite, Courier_Prime } from "next/font/google";
import { NudgeNavBar } from "../components/Nav"
import GroupPreview from "../components/ui/GroupPreview";
import DeleteButton from "../components/ui/DeleteGroupButton";

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
  imageUrl?: string;
  type: string;
}

// Kraft-paper-ish palette so generated avatars stay on-theme instead of
// clashing with the notebook background.
const AVATAR_COLORS = ["#C9825A", "#7C9070", "#7A8CA3", "#B58A5C", "#A16B6B", "#8A8578"];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Groups don't always have a photo, so fall back to a hand-lettered
// initial on a paper-toned circle rather than showing the same stock
// image for every card.
function getGroupImage(group: Group): string {
  if (group.imageUrl) return group.imageUrl;

  const initial = group.title.trim().charAt(0).toUpperCase() || "?";
  const color = AVATAR_COLORS[hashString(group.id) % AVATAR_COLORS.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="${color}" />
      <text x="50%" y="54%" font-family="Georgia, serif" font-size="90"
        fill="#FAF7ED" text-anchor="middle" dominant-baseline="middle">${initial}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function DashboardPage() {
  const router = useRouter();

  // Profile state
  const [user, setUser] = useState<UserAccount | null>(null);
  const [profileStatus, setProfileStatus] = useState<"loading" | "ready" | "error">("loading");

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

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
          if (!cancelled) router.push("/src/auth/login");
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

  function openGroup(id: string) {
    router.push(`/src/groups/${id}`);
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

        .groups-section {
          margin-bottom: 2.5rem;
        }

        .groups-section__title {
          font-size: 1.1rem;
          color: #2B2B2E;
          margin-bottom: 0.75rem;
        }

        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
          gap: 1.5rem 1rem;
        }

        .group-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .group-card__members {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: #8A8578;
          font-family: var(--font-type);
        }

        .group-card-skeleton {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .group-card-skeleton__image {
          width: 5rem;
          height: 5rem;
          border-radius: 12px;
          border: 1px solid rgba(138, 133, 120, 0.2);
          background: rgba(250, 247, 237, 0.6);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .group-card-skeleton__line {
          width: 3.5rem;
          height: 0.7rem;
          border-radius: 2px;
          background: rgba(138, 133, 120, 0.2);
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
            {loading ? "loading…" : `You are apart of ${groups.length} group${groups.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {listError && (
          <p className="mb-4 text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
            {listError}
          </p>
        )}

        {/* Real groups, split into two rows by group.type, rendered as GroupPreview cards */}

        {(["GROCERY_LIST", "SPLITTER"] as const).map((sectionType) => {
          const sectionGroups = groups.filter((g) => g.type === sectionType);
          const sectionLabel = sectionType === "GROCERY_LIST" ? "Grocery Lists" : "Receipt Splitter";

          return (
            <div key={sectionType} className="groups-section">
              <h2 className="groups-section__title">{sectionLabel}</h2>
              <div className="groups-grid">
                {loading &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="group-card-skeleton">
                      <div className="group-card-skeleton__image" />
                      <div className="group-card-skeleton__line" />
                    </div>
                  ))}

                {!loading &&
                  sectionGroups.map((group) => (
                    <div key={group.id} className="group-card">
                      <GroupPreview
                        imageUrl={getGroupImage(group)}
                        name={group.title}
                        clickPath={() => openGroup(group.id)}
                      />
                      <DeleteButton group_id={group.id} onBack=""></DeleteButton>
                    </div>
                  ))}

                {!loading && (
                  <GroupPreview
                    imageUrl="https://static.thenounproject.com/png/358073-200.png"
                    name="Create New"
                    clickPath={() => router.push(`/src/groups-create?type=${sectionType}`)}
                  ></GroupPreview>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}