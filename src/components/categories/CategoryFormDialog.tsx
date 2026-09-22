"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { Category } from "@/types/task";

export function CategoryFormDialog({
  open,
  onClose,
  category,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  onSubmit: (name: string) => { ok: boolean; message?: string };
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    // Reset the draft whenever the dialog opens for a different category.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(category?.name ?? "");
    setError("");
  }, [category, open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onSubmit(name);

    if (!result.ok) {
      setError(result.message ?? "Unable to save category.");
      return;
    }

    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={category ? "Edit category" : "Add category"}
      description="Custom categories make the dashboard and filters more useful."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="category-form" type="submit">
            {category ? "Save changes" : "Add category"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Category name
          </span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40 focus:bg-white/10"
            placeholder="Operations"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
          />
          {error ? <span className="mt-2 block text-sm text-rose-300">{error}</span> : null}
        </label>
      </form>
    </Dialog>
  );
}
