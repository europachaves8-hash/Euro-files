"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Search,
  Save,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const categories = [
  { id: "tuning", label: "Tuning" },
  { id: "removal", label: "Removal" },
  { id: "feature", label: "Feature" },
  { id: "other", label: "Other" },
];

type Product = {
  id: string;
  name: string;
  description: string;
  price_credits: number;
  category: string;
  is_active: boolean;
};

type Brand = { id: number; name: string };

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("tuning");
  const [editActive, setEditActive] = useState(true);
  const [editBrandIds, setEditBrandIds] = useState<number[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [expandedSection, setExpandedSection] = useState<string>("details");

  async function loadData() {
    const [productsRes, brandsRes, pbRes] = await Promise.all([
      supabase.from("products").select("*").order("category").order("name"),
      supabase.from("vehicle_brands").select("id, name").order("name"),
      supabase.from("product_brands").select("product_id, brand_id"),
    ]);
    setProducts(productsRes.data || []);
    setBrands(brandsRes.data || []);
    const map: Record<string, number[]> = {};
    for (const row of pbRes.data || []) {
      if (!map[row.product_id]) map[row.product_id] = [];
      map[row.product_id].push(row.brand_id);
    }
    setProductBrands(map);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function openEdit(p: Product) {
    setIsNew(false);
    setEditId(p.id);
    setEditName(p.name);
    setEditDesc(p.description || "");
    setEditPrice(String(p.price_credits));
    setEditCategory(p.category || "tuning");
    setEditActive(p.is_active);
    setEditBrandIds(productBrands[p.id] || []);
    setBrandSearch("");
    setExpandedSection("details");
    setDrawerOpen(true);
  }

  function openNew() {
    setIsNew(true);
    setEditId(null);
    setEditName("");
    setEditDesc("");
    setEditPrice("0");
    setEditCategory("tuning");
    setEditActive(true);
    setEditBrandIds([]);
    setBrandSearch("");
    setExpandedSection("details");
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditId(null);
  }

  function toggleBrand(id: number) {
    setEditBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    if (!editName.trim()) return;
    setSaving(true);

    const payload = {
      name: editName.trim(),
      description: editDesc.trim(),
      price_credits: parseFloat(editPrice) || 0,
      category: editCategory,
      is_active: editActive,
    };

    let productId = editId;

    if (isNew) {
      const { data } = await supabase.from("products").insert(payload).select().single();
      if (data) productId = data.id;
    } else if (productId) {
      await supabase.from("products").update(payload).eq("id", productId);
    }

    // Save brands
    if (productId) {
      await supabase.from("product_brands").delete().eq("product_id", productId);
      if (editBrandIds.length > 0) {
        await supabase.from("product_brands").insert(
          editBrandIds.map((brand_id) => ({ product_id: productId, brand_id }))
        );
      }
    }

    setSaving(false);
    closeDrawer();
    loadData();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this service?")) return;
    await supabase.from("products").delete().eq("id", id);
    if (editId === id) closeDrawer();
    loadData();
  }

  async function toggleActive(p: Product) {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    loadData();
  }

  function getBrandNames(productId: string): string[] {
    const ids = productBrands[productId] || [];
    return ids.map((id) => brands.find((b) => b.id === id)?.name).filter(Boolean) as string[];
  }

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const inputClass =
    "w-full h-[42px] px-4 border border-[#e2e8f0] text-sm text-[#1a202c] bg-white focus:outline-none focus:border-[#d41920] transition-colors";

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 w-48" />
        <div className="h-[400px] bg-gray-100 border border-gray-200" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Services</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1.5">
            {products.length} services
          </span>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Name</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">Category</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">Price</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">Brands</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">Status</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => {
              const names = getBrandNames(product.id);
              return (
                <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-zinc-800">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-zinc-400 mt-0.5">{product.description}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 border-l border-zinc-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-zinc-100 text-zinc-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-zinc-800 border-l border-zinc-100">
                    &euro;{Number(product.price_credits).toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 border-l border-zinc-100">
                    {names.length === 0 ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-600">
                        All Brands
                      </span>
                    ) : names.length <= 3 ? (
                      <div className="flex flex-wrap gap-1">
                        {names.map((n) => (
                          <span key={n} className="text-[10px] font-semibold px-2 py-0.5 bg-zinc-100 text-zinc-600">{n}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-zinc-100 text-zinc-600 cursor-help" title={names.join(", ")}>
                        {names.length} brands
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 border-l border-zinc-100">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        product.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-zinc-400"}`} />
                      {product.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 border-l border-zinc-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(product)}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ Drawer Overlay ═══ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-[520px] bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  {isNew ? "New Service" : "Edit Service"}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {isNew ? "Add a new service to your catalog" : editName}
                </p>
              </div>
              <button onClick={closeDrawer} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Section: Details */}
              <div className="border-b border-zinc-100">
                <button
                  onClick={() => setExpandedSection(expandedSection === "details" ? "" : "details")}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-50 transition-colors"
                >
                  <span>Service Details</span>
                  {expandedSection === "details" ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {expandedSection === "details" && (
                  <div className="px-6 pb-5 space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Name *
                      </label>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. Stage 1 Remap"
                        className={inputClass}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Short description of the service..."
                        rows={2}
                        className="w-full px-4 py-3 border border-[#e2e8f0] text-sm text-[#1a202c] bg-white focus:outline-none focus:border-[#d41920] resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                          Price (EUR) *
                        </label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          step="0.01"
                          min="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                          Category
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className={inputClass + " appearance-none cursor-pointer"}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Status
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setEditActive(true)}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-2 transition-all ${
                            editActive
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-[#e2e8f0] text-zinc-500 hover:border-zinc-300"
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${editActive ? "bg-emerald-500" : "bg-zinc-300"}`} />
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditActive(false)}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-2 transition-all ${
                            !editActive
                              ? "border-zinc-500 bg-zinc-50 text-zinc-700"
                              : "border-[#e2e8f0] text-zinc-500 hover:border-zinc-300"
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${!editActive ? "bg-zinc-500" : "bg-zinc-300"}`} />
                          Inactive
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Vehicle Brands */}
              <div className="border-b border-zinc-100">
                <button
                  onClick={() => setExpandedSection(expandedSection === "brands" ? "" : "brands")}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>Compatible Brands</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      editBrandIds.length === 0
                        ? "bg-blue-50 text-blue-600"
                        : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {editBrandIds.length === 0 ? "All" : editBrandIds.length}
                    </span>
                  </div>
                  {expandedSection === "brands" ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {expandedSection === "brands" && (
                  <div className="px-6 pb-5">
                    <p className="text-xs text-zinc-400 mb-3">
                      Select which brands this service supports. Leave empty for all brands.
                    </p>

                    {/* Search + actions */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          placeholder="Search brands..."
                          className="w-full h-[36px] pl-9 pr-3 border border-[#e2e8f0] text-xs focus:outline-none focus:border-[#d41920]"
                        />
                      </div>
                      <button
                        onClick={() => setEditBrandIds([])}
                        className="h-[36px] px-3 text-[10px] font-semibold text-[#d41920] border border-[#e2e8f0] hover:bg-red-50 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setEditBrandIds(brands.map((b) => b.id))}
                        className="h-[36px] px-3 text-[10px] font-semibold text-[#d41920] border border-[#e2e8f0] hover:bg-red-50 transition-colors"
                      >
                        All
                      </button>
                    </div>

                    {/* Selected tags */}
                    {editBrandIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-zinc-50 rounded-lg max-h-[100px] overflow-y-auto">
                        {editBrandIds.map((id) => {
                          const name = brands.find((b) => b.id === id)?.name;
                          return (
                            <button
                              key={id}
                              onClick={() => toggleBrand(id)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-zinc-200 text-[11px] font-medium text-zinc-700 hover:border-red-300 hover:bg-red-50 transition-colors"
                            >
                              {name}
                              <X size={10} className="text-zinc-400" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Brand grid */}
                    <div className="grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto border border-zinc-200 rounded-lg p-1">
                      {filteredBrands.map((brand) => {
                        const checked = editBrandIds.includes(brand.id);
                        return (
                          <button
                            key={brand.id}
                            onClick={() => toggleBrand(brand.id)}
                            className={`flex items-center gap-2.5 px-3 py-2 text-left text-xs rounded transition-colors ${
                              checked
                                ? "bg-[#d41920]/5 text-[#d41920] font-semibold"
                                : "text-zinc-600 hover:bg-zinc-50"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 transition-colors ${
                                checked ? "border-[#d41920] bg-[#d41920]" : "border-zinc-300"
                              }`}
                            >
                              {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            {brand.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between shrink-0 bg-zinc-50">
              <button
                onClick={closeDrawer}
                className="px-5 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editName.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-bold transition-all disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : isNew ? "Create Service" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
