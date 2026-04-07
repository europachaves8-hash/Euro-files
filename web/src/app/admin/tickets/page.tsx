import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Plus,
  Search,
  Eye,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-500/10", icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-500/10", icon: Loader2 },
  completed: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-zinc-500", bg: "bg-zinc-100", icon: XCircle },
};

export default async function TicketsPage() {
  const supabase = await createClient();

  // Fetch orders + items separately to avoid FK join issues
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const tickets = orders || [];

  // Fetch order items for all tickets
  const ticketIds = tickets.map((t: any) => t.id);
  let itemsMap: Record<string, string[]> = {};
  if (ticketIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, product_name")
      .in("order_id", ticketIds);
    for (const item of items || []) {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      itemsMap[item.order_id].push(item.product_name);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Tickets
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/tickets/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Ticket
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-x-auto">
        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 text-sm mb-4">No tickets yet</p>
            <Link
              href="/admin/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all"
            >
              <Plus size={16} />
              Create your first ticket
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3">
                  Client
                </th>
                <th className="text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 border-l border-zinc-200/60">
                  Vehicle &amp; Engine
                </th>
                <th className="text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 border-l border-zinc-200/60">
                  Price
                </th>
                <th className="text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 border-l border-zinc-200/60">
                  Status
                </th>
                <th className="text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 border-l border-zinc-200/60">
                  Ticket Date
                </th>
                <th className="text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 border-l border-zinc-200/60">
                  ID
                </th>
                <th className="text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 border-l border-zinc-200/60">
                  Priority
                </th>
                <th className="text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 border-l border-zinc-200/60">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tickets.map((ticket: any) => {
                const st = statusConfig[ticket.status] || statusConfig.pending;
                const StatusIcon = st.icon;
                const services = itemsMap[ticket.id]?.join(", ") || "—";
                const vehicle = [ticket.vehicle_make, ticket.vehicle_model].filter(Boolean).join(" ");
                const engine = ticket.vehicle_engine || "";
                const date = new Date(ticket.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={ticket.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-800">
                      {ticket.client_name || "—"}
                    </td>
                    <td className="px-5 py-3.5 border-l border-zinc-100">
                      <div className="text-sm font-medium text-zinc-800">
                        {vehicle || "Not specified"}
                        {engine && (
                          <span className="text-zinc-500 font-normal">
                            {" "}{engine}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5 truncate max-w-[300px]">
                        {services}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-zinc-800 border-l border-zinc-100">
                      €{Number(ticket.price_eur || ticket.total_credits || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 border-l border-zinc-100">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>
                        <StatusIcon size={12} strokeWidth={2.5} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 border-l border-zinc-100">
                      {date}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600 border-l border-zinc-100">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3.5 border-l border-zinc-100">
                      <span className="text-xs font-medium text-[#d41920]">
                        {ticket.priority === "urgent" ? "Urgent" : "0-1 hour"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 border-l border-zinc-100">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d41920] hover:underline"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
