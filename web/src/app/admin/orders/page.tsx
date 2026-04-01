import { createClient } from "@/lib/supabase-server";

async function getOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, profiles(first_name, last_name, email:id)")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">
        Orders
      </h1>

      <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Order ID
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Vehicle
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Status
              </th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Credits
              </th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-400 text-sm">
                  Nenhum pedido encontrado
                </td>
              </tr>
            )}
            {orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-mono text-zinc-700">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="px-5 py-3.5 text-sm text-zinc-600">
                  {order.vehicle_make || "--"} {order.vehicle_model || ""}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
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
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold text-zinc-800 text-right font-mono">
                  €{Number(order.total_credits || 0).toFixed(2)}
                </td>
                <td className="px-5 py-3.5 text-sm text-zinc-400 text-right">
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
