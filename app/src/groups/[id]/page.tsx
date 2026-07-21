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
import GroceryAdd from "../../components/ui/GroceryAdd";

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

type Member = { id: string; phone: string };

type GroceryList = {
  id: string;
  groupId: string;
};

type GroceryItemType = {
  id: string;
  name: string;
  price?: number;
  quantity: number;
  completed: boolean;
  assignedTo?: string;
};

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
  const [actionError, setActionError] = useState<string | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  // Bumped after join/leave to re-trigger the members fetch below
  const [membersVersion, setMembersVersion] = useState(0);

  // Grocery list state
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [itemsByList, setItemsByList] = useState<Record<string, GroceryItemType[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({});
  const [itemsError, setItemsError] = useState<Record<string, string | null>>({});

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

  // Find (or create the reference to) this group's grocery list, then load its items
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadGroceryList() {
      try {
        const res = await fetch("/api/grocery");
        const data: GroceryList[] = await res.json();
        if (!res.ok) return;

        const list = data.find((l) => l.groupId === id);
        if (!list || cancelled) return;

        setGroceryList(list);
        loadItems(list.id);
      } catch (err) {
        console.error(err);
      }
    }

    loadGroceryList();
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

  const currentItems = groceryList ? itemsByList[groceryList.id] ?? [] : [];
  const currentItemsLoading = groceryList ? itemsLoading[groceryList.id] : false;
  const currentItemsError = groceryList ? itemsError[groceryList.id] : null;

  function handleItemAdded(newItem: GroceryItemType) {
    if (!groceryList) return;
    setItemsByList((s) => ({
      ...s,
      [groceryList.id]: [...(s[groceryList.id] ?? []), newItem],
    }));
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
    <NudgeNavBar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <GroupHero 
          groupName = "test" // TO-DO: add dynmaic group name
          description = "Lorem Epsum" // TO-DO: add description in database
          group_id = {id}
          imageUrl = "" // TO-DO: add image to database
          onBack = "/src/groups"
        />

        {currentItemsLoading && (
          <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
            Loading items...
          </p>
        )}

        {currentItemsError && (
          <p className="text-sm text-[#B33A3A]" style={{ fontFamily: "var(--font-type)" }}>
            {currentItemsError}
          </p>
        )}

        {!currentItemsLoading && !currentItemsError && currentItems.length === 0 && groceryList && (
          <p className="text-sm text-[#8A8578]" style={{ fontFamily: "var(--font-type)" }}>
            No items yet.
          </p>
        )}

        {currentItems.map((item) => (
          <GroceryItem
            key={item.id}
            name={item.name}
            price={item.price?.toString() ?? ""}
            quantity={item.quantity.toString()}
            completed={item.completed}
            assignedTo={item.assignedTo ?? ""}
          />
        ))}

        <GroceryAdd groupId={id} onItemAdded={handleItemAdded} />

      </div>
    </div>
  );
}