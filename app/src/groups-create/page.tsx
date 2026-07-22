"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../components/ui/Button";
import TextField from "../components/ui/FieldInput";

export default function CreateGroup() {
  const searchParams = useSearchParams();
  const sectionType = searchParams.get("type") ?? "grocery";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState("");
  const [type, setType] = useState(sectionType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim() || undefined,
          img: img || undefined,
          type,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to create group");
      }

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setTitle("");
    setDescription("");
    setImg("");
    setType("");
    setError(null);
    router.push("/src/groups");
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 8,
          padding: 24,
          width: 400,
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Create New {sectionType === "event" ? "Event" : "Grocery"} Group</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextField label="Title" value={title} onChange={(value: string) => setTitle(value)} />
          <TextField label="Description" value={description} onChange={(value: string) => setDescription(value)} />
          <TextField label="Image Link" value={img} onChange={(value: string) => setImg(value)} />
        </div>

        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreate}>{saving ? "Creating..." : "Create New Group"}</Button>
        </div>
      </div>
    </div>
  );
}