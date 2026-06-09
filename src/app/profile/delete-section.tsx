"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteProfileAction } from "./delete-action";

export function DeleteProfileSection() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <section className="mt-16 rounded-2xl border border-red-200 bg-red-50/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-red-800">Delete profile</p>
          <p className="mt-1 text-xs text-red-600">
            Permanently removes your profile and all data from the directory.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-100"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      {open && (
        <form action={deleteProfileAction} className="mt-6 flex flex-col gap-4 border-t border-red-200 pt-6">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-red-800">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </span>
            <input
              type="text"
              name="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              className="h-12 rounded-full border border-red-200 bg-white px-5 text-base outline-none focus:border-red-400"
            />
          </label>
          <button
            type="submit"
            disabled={confirmText !== "DELETE"}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-8 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={15} />
            Permanently delete profile
          </button>
        </form>
      )}
    </section>
  );
}
