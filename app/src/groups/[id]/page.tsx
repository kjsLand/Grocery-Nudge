"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Kalam, Special_Elite, Courier_Prime } from "next/font/google";
import { Users, LogIn, LogOut, Trash2, ArrowLeft } from "lucide-react";
import { NudgeNavBar } from "../../components/Nav"
import { GroceryListsSection } from "../../grocery_section/page";
import GroupHero from "@/app/src/components/ui/GroupHero"
import LeaveButton from "../../components/ui/LeaveGroupButton";
import DeleteButton from "../../components/ui/DeleteGroupButton";
import GroceryItem from "../../components/ui/GroceryItem";

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
  leaderId: string;
}

type Member = { id: string; phone: string }

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

  const [members, setMembers] = useState<Member[]>([]);
  // Bumped after join/leave to re-trigger the members fetch below
  const [membersVersion, setMembersVersion] = useState(0);



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

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadMembers() {
      const memberRes = await fetch(`/api/groups/${id}/members`);
      if (!memberRes.ok) return;
      const memberIds: string[] = await memberRes.json();

      if (memberIds.length === 0) {
        if (!cancelled) setMembers([]);
        return;
      }

      const usersRes = await fetch(`/api/users?ids=${memberIds.join(',')}`);
      if (!usersRes.ok) return;
      const users: Member[] = await usersRes.json();

      if (!cancelled) setMembers(users);
    }

    loadMembers();

    return () => {
      cancelled = true;
    };
    // membersVersion is a manual trigger — bumped after join/leave so this refetches
  }, [id, membersVersion]);

  const isMember = !!user && members.some((m) => m.id === user.id);

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
      <GroupHero 
        groupName = "test" // TO-DO: add dynmaic group name
        description = "Lorem Epsum" // TO-DO: add description in database
        group_id = {id}
        imageUrl = "" // TO-DO: add image to database
        onBack = "/src/groups"
      />

      <GroceryItem 
        name="Apple" 
        price="1.00" 
        quantity="10"
        completed={false} 
        assignedTo={""}
      />

        {!loading && group && (
          <>

            {actionError && (
              <p className="mb-4 text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
                {actionError}
              </p>
            )}

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
                    <li key={m.id} className="text-sm text-[#2B2B2E]" style={{ fontFamily: "var(--font-type)" }}>
                      {m.phone.substring(0, 3) + "-" + m.phone.substring(3, 6) + "-" + m.phone.substring(6, 10)}
                    </li>
                  ))}
                </ul>
              )}
            </div>


            {!loading && group && (
              <>
                {/* existing content */}
                <GroceryListsSection groupId={id} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}