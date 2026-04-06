import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import {
  Wallet,
  Ticket,
  CheckCircle2,
  TrendingUp,
  Plus,
  Eye,
  FileText,
  Clock,
} from "lucide-react";

async function getStats() {
  const supabase = await createClient();

  const [ordersRes, pendingRes, completedRes, revenueRes, recentRes] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase.from("orders").select("price_eur, total_credits"),
      supabase
        .from("orders")
        .select(
          "id, status, price_eur, total_credits, vehicle_make, vehicle_model, vehicle_engine, client_name, priority, created_at, profiles(first_name, last_name), order_items(product_name)"
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const totalRevenue =
    revenueRes.data?.reduce(
      (sum, o) => sum + Number(o.price_eur || o.total_credits || 0),
      0
    ) || 0;

  return {
    totalOrders: ordersRes.count || 0,
    pending: pendingRes.count || 0,
    completed: completedRes.count || 0,
    totalRevenue,
    recentOrders: recentRes.data || [],
  };
}

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-zinc-100 text-zinc-500",
};

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a202c]">
            Dashboard
          </h1>
          <p className="text-sm text-[#718096] mt-0.5">
            Welcome back! Here is an overview of your account.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/tickets/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Ticket
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Balance",
            value: `${stats.totalRevenue.toFixed(2)} \u20AC`,
            icon: Wallet,
            color: "text-[#d41920]",
            link: "/admin/tickets",
            linkText: "View Orders",
          },
          {
            label: "Open Tickets",
            value: stats.pending,
            icon: Ticket,
            color: "text-blue-600",
            link: "/admin/tickets",
            linkText: "View Tickets",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-emerald-600",
            link: "/admin/tickets",
            linkText: "View History",
          },
          {
            label: "Total Spent",
            value: `${stats.totalRevenue.toFixed(2)} \u20AC`,
            icon: TrendingUp,
            color: "text-[#1a202c]",
            link: "/admin/tickets",
            linkText: "Purchases",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-[#e2e8f0] p-5"
          >
            <p className="text-xs font-medium text-[#718096] mb-1">
              {card.label}
            </p>
            <p className={`text-2xl font-extrabold tracking-tight ${card.color}`}>
              {card.value}
            </p>
            <Link
              href={card.link}
              className="text-xs font-semibold text-[#d41920] hover:underline mt-2 inline-block"
            >
              {card.linkText} &rarr;
            </Link>
          </div>
        ))}
      </div>

      {/* Your Tickets */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-base font-bold text-[#1a202c]">Your Tickets</h2>
          <Link
            href="/admin/tickets/new"
            className="px-4 py-2 bg-[#d41920] hover:bg-[#b01018] text-white text-xs font-semibold transition-all"
          >
            Create Ticket
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <Ticket size={32} className="text-[#e2e8f0] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-[#718096] mb-4">
              You don't have any tickets yet.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/admin/tickets/new"
                className="px-5 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-xs font-semibold transition-all"
              >
                Place a Ticket
              </Link>
              <Link
                href="/admin/tickets"
                className="px-5 py-2.5 border border-[#d41920] text-[#d41920] hover:bg-[#d41920] hover:text-white text-xs font-semibold transition-all"
              >
                View Tickets
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">Status</th>
                  <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">ID</th>
                  <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">Vehicle & Engine</th>
                  <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">Client</th>
                  <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">Price</th>
                  <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">Date</th>
                  <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">Priority</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {stats.recentOrders.map((order: any) => {
                  const vehicle = [order.vehicle_make, order.vehicle_model, order.vehicle_engine]
                    .filter(Boolean).join(" ");
                  const client = order.client_name ||
                    (order.profiles ? `${order.profiles.first_name || ""} ${order.profiles.last_name || ""}`.trim() : "—");
                  const date = new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                  });
                  return (
                    <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 ${statusStyle[order.status] || statusStyle.pending}`}>
                          {order.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#4a5568]">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-[#1a202c]">{vehicle || "—"}</p>
                        <p className="text-[11px] text-[#718096] truncate max-w-[220px]">
                          {order.order_items?.map((i: any) => i.product_name).join(", ") || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#4a5568]">{client}</td>
                      <td className="px-5 py-3 text-sm font-bold text-[#1a202c]">
                        {Number(order.price_eur || order.total_credits || 0).toFixed(2)} &euro;
                      </td>
                      <td className="px-5 py-3 text-xs text-[#718096]">{date}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1 text-xs font-medium text-[#d41920]">
                          <Clock size={12} />
                          {order.priority || "0-1h"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/admin/tickets/${order.id}`} className="flex items-center gap-1 text-xs font-semibold text-[#d41920] hover:underline">
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-[#e2e8f0] text-center">
              <Link href="/admin/tickets" className="text-xs font-semibold text-[#d41920] hover:underline">
                View all tickets &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
