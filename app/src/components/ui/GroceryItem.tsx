import { useState } from "react";
import { Trash } from "lucide-react";
import Button from "./Button";

type GroceryItemUpdate = {
  name: string;
  quantity: number;
  price: string;
  isCompleted: boolean;
  assignedId: string | null;
};

interface GroceryItemProps {
  id: string;
  name: string;
  isCompleted: boolean;
  assignedId?: string | null;
  price: string;
  quantity: string;
  currentUserId?: string;
  onDeleted?: (id: string) => void;
  onUpdated?: (id: string, updates: Partial<GroceryItemUpdate>) => void;
}

export default function GroceryItem({
  id,
  name,
  price,
  quantity,
  isCompleted,
  assignedId,
  currentUserId,
  onDeleted,
  onUpdated,
}: GroceryItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/item/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to delete item");

      onDeleted?.(id);
    } catch (err) {
      console.error(err);
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdate(updates: Partial<GroceryItemUpdate>) {
    if (updating || Object.keys(updates).length === 0) return;
    setUpdating(true);
    setUpdateError(null);

    try {
      const res = await fetch(`/api/item/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to update item");

      onUpdated?.(id, updates);
    } catch (err) {
      console.error(err);
      setUpdateError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="grocery-item">
      <style>{`
        .grocery-item {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(138, 133, 120, 0.25);
          border-radius: 2px;
          background: #F4EFE6;
          box-shadow: 3px 4px 0 rgba(43, 43, 46, 0.06);
        }

        .grocery-item__row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.75rem;
        }

        .grocery-item__checkbox {
          flex-shrink: 0;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid #8A8578;
          border-radius: 2px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: background 0.15s, border-color 0.15s;
        }

        .grocery-item__checkbox--done {
          background: #2B2B2E;
          border-color: #2B2B2E;
        }

        .grocery-item__checkbox-mark {
          color: #FAF7ED;
          font-size: 0.75rem;
          line-height: 1;
        }

        .grocery-item__name {
          font-family: var(--font-hand);
          font-size: 1.25rem;
          line-height: 1.2;
          color: #2B2B2E;
        }

        .grocery-item__name--done {
          color: #8A8578;
          text-decoration: line-through;
          text-decoration-color: rgba(138, 133, 120, 0.6);
        }

        .grocery-item__assigned {
          font-family: var(--font-type);
          font-size: 0.75rem;
          color: #8A8578;
          padding-left: 2rem;
        }

        .grocery-item__take-btn {
          font-family: var(--font-type);
          font-size: 0.75rem;
          color: #B33A3A;
          background: transparent;
          border: none;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
        }

        .grocery-item__take-btn:hover {
          color: #8f2e2e;
        }

        .grocery-item__take-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .grocery-item__delete-error {
          font-family: var(--font-type);
          font-size: 0.75rem;
          color: #B33A3A;
          padding-left: 2rem;
        }
      `}</style>

      <div className="grocery-item__row">
        <button
          onClick={() => handleUpdate({ isCompleted: !isCompleted })}
          disabled={updating}
          aria-pressed={isCompleted}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          className={`grocery-item__checkbox ${isCompleted ? "grocery-item__checkbox--done" : ""}`}
        >
          {isCompleted && <span className="grocery-item__checkbox-mark">✓</span>}
        </button>
        <h1 className={`grocery-item__name ${isCompleted ? "grocery-item__name--done" : ""}`}>
          {name}
        </h1>
        <h1 className={`grocery-item__name`}>
          x {quantity}
        </h1>
        <h1 className={`grocery-item__name`}>
          -- ${price}
        </h1>
        <Button onClick={handleDelete} disabled={deleting} aria-label="Delete item">
          <Trash />
        </Button>
      </div>

      <p className="grocery-item__assigned">
        {assignedId ? (
          `Assigned to ${assignedId}`
        ) : (
          <>
            Unassigned —{" "}
          </>
        )}
        <button
          onClick={() => currentUserId && handleUpdate({ assignedId: currentUserId })}
          disabled={updating || !currentUserId}
          className="grocery-item__take-btn"
        >
          - take ownership
        </button>
      </p>

      {deleteError && <p className="grocery-item__delete-error">{deleteError}</p>}
      {updateError && <p className="grocery-item__delete-error">{updateError}</p>}
    </div>
  );
}