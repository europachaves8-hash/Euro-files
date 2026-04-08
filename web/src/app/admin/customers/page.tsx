import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import {
  Users,
  UserCheck,
  TrendingUp,
  Search,
  Eye,
  Ticket,
  Mail,
  Calendar,
  Building2,
} from "lucide-react";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  country: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  price_eur: number | null;
  total_credits: number | null;
  status: string;
  created_at: string;
}

async function getCustomersData() {
  const supabase = await createClient();

  // Get all customer profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Get all orders to calculate per-user stats
  const { data: orders } = await supabase
    .from("orders")
    .select("id, user_id, price_eur, total_credits, status, created_at");

  const allProfiles = (profiles || []) as Profile[];
  const allOrders = (orders || []) as Order[];

  // Build per-user stats
  const userStats: Record<
    string,
    { totalSpent: number; ticketCount: number; lastOrder: string | null }
  > = {};

  allOrders.forEach((o) => {
    if (!userStats[o.user_id]) {
      userStats[o.user_id] = { totalSpent: 0, ticketCount: 0, lastOrder: null };
    }
    userStats[o.user_id].totalSpent += Number(
      o.price_eur || o.total_credits || 0
    );
    userStats[o.user_id].ticketCount += 1;
    if (
      !userStats[o.user_id].lastOrder ||
      o.created_at > userStats[o.user_id].lastOrder!
    ) {
      userStats[o.user_id].lastOrder = o.created_at;
    }
  });

  const customers = allProfiles.filter((p) => p.role !== "admin");
  const totalCustomers = customers.length;
  const withOrders = customers.filter((c) => userStats[c.id]?.ticketCount > 0).length;
  const totalRevenue = Object.values(userStats).reduce(
    (sum, s) => sum + s.totalSpent,
    0
  );

  // Recent signups (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignups = customers.filter(
    (c) => new Date(c.created_at) > thirtyDaysAgo
  ).length;

  return {
    customers,
    userStats,
    totalCustomers,
    withOrders,
    totalRevenue,
    recentSignups,
  };
}

export default async function CustomersPage() {
  const data = await getCustomersData();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a202c]">
            Customers
          </h1>
          <p className="text-sm text-[#718096] mt-0.5">
            Overview of all registered users and their activity.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Customers",
            value: data.totalCustomers,
            icon: Users,
            sub: `${data.recentSignups} new this month`,
          },
          {
            label: "Active Customers",
            value: data.withOrders,
            icon: UserCheck,
            sub: "With at least 1 order",
          },
          {
            label: "Total Revenue",
            value: `${data.totalRevenue.toFixed(2)} \u20AC`,
            icon: TrendingUp,
            sub: "From all customers",
          },
          {
            label: "Avg. per Customer",
            value:
              data.withOrders > 0
                ? `${(data.totalRevenue / data.withOrders).toFixed(2)} \u20AC`
                : "0.00 \u20AC",
            icon: Ticket,
            sub: "Revenue per active customer",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-[#e2e8f0] p-5"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-[#718096]">{card.label}</p>
              <card.icon size={16} className="text-[#cbd5e0]" strokeWidth={1.8} />
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-[#1a202c]">
              {card.value}
            </p>
            <p className="text-[11px] text-[#a0aec0] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Customer List */}
      <CustomerTable
        customers={data.customers}
        userStats={data.userStats}
      />
    </div>
  );
}

function CustomerTable({
  customers,
  userStats,
}: {
  customers: Profile[];
  userStats: Record<
    string,
    { totalSpent: number; ticketCount: number; lastOrder: string | null }
  >;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
        <h2 className="text-base font-bold text-[#1a202c]">
          All Customers ({customers.length})
        </h2>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12">
          <Users
            size={32}
            className="text-[#e2e8f0] mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-sm text-[#718096]">No customers registered yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">
                  Customer
                </th>
                <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">
                  Email
                </th>
                <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">
                  Company
                </th>
                <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">
                  Country
                </th>
                <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">
                  Tickets
                </th>
                <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">
                  Total Spent
                </th>
                <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">
                  Registered
                </th>
                <th className="text-left text-[10px] font-semibold text-[#718096] uppercase tracking-wider px-5 py-2.5">
                  Last Order
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {customers.map((c) => {
                const stats = userStats[c.id] || {
                  totalSpent: 0,
                  ticketCount: 0,
                  lastOrder: null,
                };
                const name =
                  [c.first_name, c.last_name].filter(Boolean).join(" ") || "—";
                const initials = (
                  (c.first_name?.[0] || "") + (c.last_name?.[0] || "")
                ).toUpperCase() || "?";
                const registered = new Date(c.created_at).toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "2-digit", year: "numeric" }
                );
                const lastOrder = stats.lastOrder
                  ? new Date(stats.lastOrder).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-[#fafafa] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1a202c] text-white text-[11px] font-bold flex items-center justify-center rounded-full shrink-0">
                          {initials}
                        </div>
                        <span className="text-sm font-semibold text-[#1a202c]">
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={`mailto:${c.email}`}
                        className="text-sm text-[#4a5568] hover:text-[#d41920] transition-colors"
                      >
                        {c.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#4a5568]">
                      {c.company || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#4a5568]">
                      {c.country || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-sm font-bold ${
                          stats.ticketCount > 0
                            ? "text-[#1a202c]"
                            : "text-[#cbd5e0]"
                        }`}
                      >
                        {stats.ticketCount}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-sm font-bold ${
                          stats.totalSpent > 0
                            ? "text-[#1a202c]"
                            : "text-[#cbd5e0]"
                        }`}
                      >
                        {stats.totalSpent.toFixed(2)} &euro;
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#718096]">
                      {registered}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#718096]">
                      {lastOrder}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
