import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "./Button";

export default function GroceryAdd() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    setName("");
    setQuantity("");
    setAssignedTo("");
  }

  return (
    <div className="grocery-add">
      <style>{`
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

        .grocery-add__input--assign {
          flex: 1 1 8rem;
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
      `}</style>

      <input
        className="grocery-add__input grocery-add__input--name"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="grocery-add__input grocery-add__input--qty"
        placeholder="Qty"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <input
        className="grocery-add__input grocery-add__input--assign"
        placeholder="Assign to"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
      />

      <button onClick={handleAdd} disabled={!name.trim()} className="grocery-add__btn">
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        New Item
      </button>
    </div>
  );
}