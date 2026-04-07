"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

const statuses = [
  { id: "pending", label: "Pending", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "completed", label: "Completed", color: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "cancelled", label: "Cancelled", color: "bg-zinc-400", bg: "bg-zinc-50 text-zinc-600 border-zinc-200" },
];

export function TicketStatusSelect({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (!error) {
      setStatus(newStatus);
    }
    setSaving(false);
  }

  const current = statuses.find((s) => s.id === status) || statuses[0];

  return (
    <div className="flex items-center gap-2">
      {statuses.map((s) => (
        <button
          key={s.id}
          onClick={() => handleChange(s.id)}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
            status === s.id
              ? s.bg + " border"
              : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
          } ${saving ? "opacity-50" : ""}`}
        >
          <span className={`w-2 h-2 rounded-full ${s.color}`} />
          {s.label}
        </button>
      ))}
    </div>
  );
}
