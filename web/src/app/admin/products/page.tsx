"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Save,
} from "lucide-react";

const categories = ["tuning", "removal", "feature", "other"];

type Product = {
  id: string;
  name: string;
  description: string;
  price_credits: number;
  category: string;
  is_active: boolean;
};

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editActive, setEditActive] = useState(true);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.description || "");
    setEditPrice(String(p.price_credits));
    setEditCategory(p.category || "tuning");
    setEditActive(p.is_active);
    setAdding(false);
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setEditName("");
    setEditDesc("");
    setEditPrice("0");
    setEditCategory("tuning");
    setEditActive(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setAdding(false);
  }

  async function saveEdit() {
    if (!editName.trim()) return;
    const payload = {
      name: editName.trim(),
      description: editDesc.trim(),
      price_credits: parseFloat(editPrice) || 0,
      category: editCategory,
      is_active: editActive,
    };

    if (adding) {
      await supabase.from("products").insert(payload);
    } else if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    }

    cancelEdit();
    loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this service?")) return;
    await supabase.from("products").delete().eq("id", id);
    loadProducts();
  }

  async function toggleActive(p: Product) {
    await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    loadProducts();
  }

  const inputClass =
    "w-full h-[38px] px-3 border border-[#e2e8f0] text-sm text-[#1a202c] bg-white focus:outline-none focus:border-[#d41920] transition-colors";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 w-48" />
        <div className="h-[400px] bg-gray-100 border border-gray-200" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Products
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1.5">
            {products.length} services
          </span>
          <button
            onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Name
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                Category
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                Price
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                Status
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {/* Add new row */}
            {adding && (
              <tr className="bg-red-50/30">
                <td className="px-5 py-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Service name"
                    className={inputClass}
                    autoFocus
                  />
                  <input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className={inputClass + " mt-1"}
                  />
                </td>
                <td className="px-5 py-3">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={selectClass}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className={inputClass + " w-28"}
                    step="0.01"
                    min="0"
                  />
                </td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => setEditActive(!editActive)}
                    className={`inline-block w-3 h-3 rounded-full ${
                      editActive ? "bg-emerald-500" : "bg-zinc-300"
                    }`}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={saveEdit}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 text-zinc-400 hover:bg-zinc-100 transition-colors"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-zinc-50/50 transition-colors"
              >
                {editingId === product.id ? (
                  /* Editing row */
                  <>
                    <td className="px-5 py-3">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={inputClass}
                        autoFocus
                      />
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        className={inputClass + " mt-1"}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className={selectClass}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className={inputClass + " w-28"}
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setEditActive(!editActive)}
                        className={`inline-block w-3 h-3 rounded-full ${
                          editActive ? "bg-emerald-500" : "bg-zinc-300"
                        }`}
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={saveEdit}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-zinc-400 hover:bg-zinc-100 transition-colors"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  /* Display row */
                  <>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-zinc-800">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 border-l border-zinc-100">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-zinc-100 text-zinc-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-zinc-800 text-left border-l border-zinc-100">
                      €{Number(product.price_credits).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 border-l border-zinc-100">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          product.is_active
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                        title={product.is_active ? "Click to disable" : "Click to enable"}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            product.is_active
                              ? "bg-emerald-500"
                              : "bg-zinc-400"
                          }`}
                        />
                        {product.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 border-l border-zinc-100">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 text-zinc-400 hover:text-[#d41920] hover:bg-red-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
