"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";

type Member = { id: string; phone: string };

interface MembersProps {
  id: string;
}

export function Members({ id }: MembersProps) {
  const [members, setMembers] = useState<Member[]>([]);

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

      const usersRes = await fetch(`/api/users?ids=${memberIds.join(",")}`);
      if (!usersRes.ok) return;
      const users: Member[] = await usersRes.json();

      if (!cancelled) setMembers(users);
    }

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <span className="group-row__members">
      <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
      {members.length}
    </span>
  );
}