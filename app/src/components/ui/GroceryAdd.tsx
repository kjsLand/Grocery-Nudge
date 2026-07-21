import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "./Button";

type GroceryList = {
  id: string;
  groupId: string;
};

interface GroceryAddProps {
  groupId: string;
  onItemAdded?: (item: any) => void;
}

export default function GroceryAdd({ groupId, onItemAdded }: GroceryAddProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Find the grocery list that belongs to this group
      const listsRes = await fetch("/api/grocery");
      const lists = await listsRes.json();

      if (!listsRes.ok) {
        setErrorMsg(lists.error ?? "Failed to load grocery list");
        return;
      }

      const list = lists.find((item: GroceryList) => item.groupId === groupId);

      if (!list) {
        setErrorMsg("No grocery list found for this group");
        return;
      }

      const addRes = await fetch(`/api/grocery/${list.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          quantity: Number(quantity) ?? 0,
          price: price ?? "0",
        }),
      });

      const addData = await addRes.json();

      if (!addRes.ok) {
        setErrorMsg(addData.error ?? "Failed to add item");
        return;
      }

      onItemAdded?.(addData);
      setName("");
      setQuantity("");
      setPrice("");
    } catch (err) {
      setErrorMsg("Network error — try again");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Render the actual add-item form ----

  return (
    <div className="grocery-add">
      <style>{baseStyles}</style>

      <input
        className="grocery-add__input grocery-add__input--name"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="grocery-add__input grocery-add__input--qty"
        placeholder="Qty"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <input
        className="grocery-add__input grocery-add__input--price"
        placeholder="Price"
        type="number"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button onClick={handleAdd} disabled={!name.trim() || submitting} className="grocery-add__btn">
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        {submitting ? "Adding..." : "New Item"}
      </button>

      {errorMsg && <div className="grocery-add__error">{errorMsg}</div>}
    </div>
  );
}

const baseStyles = `
  .grocery-add {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border: 2px dashed rgba(138, 133, 120, 0.4);
    border-radius: 2px;
    background: rgba(250, 247, 237, 0.6);
  }

  .grocery-add--status {
    color: #8A8578;
    font-family: var(--font-type);
    font-size: 0.8125rem;
  }

  .grocery-add__status-text {
    color: #8A8578;
  }

  .grocery-add__input {
    font-family: var(--font-type);
    font-size: 0.8125rem;
    color: #2B2B2E;
    background: #FAF7ED;
    border: 1px solid rgba(138, 133, 120, 0.3);
    border-radius: 2px;
    padding: 0.5rem 0.625rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .grocery-add__input::placeholder {
    color: #8A8578;
  }

  .grocery-add__input:focus {
    border-color: #2B2B2E;
  }

  .grocery-add__input--name {
    flex: 2 1 10rem;
  }

  .grocery-add__input--qty {
    flex: 1 1 6rem;
  }

  .grocery-add__input--price {
    flex: 1 1 6rem;
  }

  .grocery-add__btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-type);
    font-size: 0.8125rem;
    color: #FAF7ED;
    background: #2B2B2E;
    border: none;
    border-radius: 2px;
    padding: 0.5rem 0.875rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .grocery-add__btn:hover {
    background: rgba(43, 43, 46, 0.9);
  }

  .grocery-add__btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .grocery-add__error {
    flex-basis: 100%;
    font-family: var(--font-type);
    font-size: 0.75rem;
    color: #B3413B;
  }
`;