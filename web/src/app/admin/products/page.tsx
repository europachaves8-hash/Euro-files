import { createClient } from "@/lib/supabase-server";

async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  return data || [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Products
        </h1>
        <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
          {products.length} services
        </span>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Name
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Category
              </th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Price
              </th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product: any) => (
              <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="text-sm font-medium text-zinc-800">
                    {product.name}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {product.description}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
                    {product.category}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold text-zinc-800 text-right font-mono">
                  €{Number(product.price_credits).toFixed(2)}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      product.is_active ? "bg-emerald-500" : "bg-zinc-300"
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
