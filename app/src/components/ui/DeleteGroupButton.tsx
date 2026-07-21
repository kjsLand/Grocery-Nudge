import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface GroupProps{
    group_id: string, 
    onBack: string
}

export default function DeleteButton({ group_id, onBack }: GroupProps){
  const router = useRouter();

    async function handleDelete() {
    if (!group_id) return;

    try {
      const res = await fetch(`/api/groups/${group_id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to leave group");

    } catch (err) {
      console.error(err);
    }
    finally{
        router.push(onBack)
    }
  }


    return(
        // delete member api and on back router push to different page
        <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-sm border border-[#8A8578]/50 px-3 py-1.5 text-sm text-[#2B2B2E] hover:bg-[#8A8578]/10 disabled:opacity-40"
        >
            <Trash className="h-3.5 w-3.5" />
            Delete
        </button>
    )
}