import { createClient } from "@/lib/supabase-server";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  TrendingUp,
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
      supabase.from("orders").select("total_credits"),
      supabase
        .from("orders")
        .select("id, status, total_credits, vehicle_make, created_at, profiles(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const totalRevenue =
    revenueRes.data?.reduce((sum, o) => sum + Number(o.total_credits || 0), 0) || 0;

  return {
    totalOrders: ordersRes.count || 0,
    pending: pendingRes.count || 0,
    completed: completedRes.count || 0,
    totalRevenue,
    recentOrders: recentRes.data || [],
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Total Revenue",
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Delivered",
      value: stats.completed,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-zinc-200/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} strokeWidth={2} />
              </div>
            </div>
            <div className="text-2xl font-bold text-zinc-900 tracking-tight font-mono">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-900">Recent Orders</h2>
          <a
            href="/admin/orders"
            className="text-xs font-semibold text-[#e63956] hover:underline"
          >
            View all
          </a>
        </div>
        <div className="divide-y divide-zinc-100">
          {stats.recentOrders.length === 0 && (
            <div className="px-5 py-8 text-center text-zinc-400 text-sm">
              Nenhum pedido ainda
            </div>
          )}
          {stats.recentOrders.map((order: any) => (
            <div
              key={order.id}
              className="flex items-center justify-between px-5 py-3.5"
            >
              <div>
                <div className="text-sm font-medium text-zinc-800">
                  #{order.id.slice(0, 8)}
                </div>
                <div className="text-xs text-zinc-400">
                  {order.profiles?.first_name
                    ? `${order.profiles.first_name} ${order.profiles.last_name || ""}`
                    : "Registered user"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-zinc-800 font-mono">
                  €{Number(order.total_credits || 0).toFixed(2)}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    order.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : order.status === "pending"
                      ? "bg-amber-500/10 text-amber-600"
                      : order.status === "in_progress"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
