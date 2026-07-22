import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

interface GroupProps {
    group_id: string;
    onBack?: string;
    onDeleted?: () => void;
}

export default function DeleteButton({ group_id, onBack, onDeleted }: GroupProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!group_id) return;

    try {
      const res = await fetch(`/api/groups/${group_id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to leave group");

      onDeleted?.();
      if (onBack) router.push(onBack);
    } catch (err) {
      console.error(err);
    }
  }

    return(
        <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-sm border border-[#8A8578]/50 px-3 py-1.5 text-sm text-[#2B2B2E] hover:bg-[#8A8578]/10 disabled:opacity-40"
        >
            <Trash className="h-3.5 w-3.5" />
            Delete
        </button>
    )
}