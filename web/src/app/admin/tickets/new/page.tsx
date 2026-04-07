"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Car,
  Wrench,
  FileText,
  CheckCircle2,
  X,
  ChevronRight,
  Cpu,
  User,
  Tractor,
  Ship,
  Bike,
  Truck,
} from "lucide-react";

/* ───────────────────── Static Data ───────────────────── */

const vehicleTypes = [
  { id: "car", label: "Car", icon: Car },
  { id: "truck", label: "Truck", icon: Truck },
  { id: "agriculture", label: "Agriculture", icon: Tractor },
  { id: "boat", label: "Boat", icon: Ship },
  { id: "motorcycle", label: "Motorcycle", icon: Bike },
];

const gearboxOptions = ["Manual", "Automatic", "DSG/DCT", "CVT", "Other"];

const yearOptions = Array.from({ length: 27 }, (_, i) => 2026 - i); // 2026 → 2000

const readingTools = [
  "Autotuner Boot/BDM/JTAG",
  "Autotuner OBD",
  "BDM100",
  "bFlash Boot/BDM/JTAG",
  "bFlash OBD",
  "BitBox OBD",
  "CMD Flash Boot/BDM/JTAG",
  "CMD Flash OBD",
  "DFOX Boot/BDM/JTAG",
  "DFOX OBD",
  "DIMSPORT Genius",
  "DIMSPORT Trasdata",
  "dimtronic Boot/BDM/JTAG",
  "dimtronic OBD",
  "Eprom programmer",
  "FGtech Boot/BDM/JTAG",
  "FGtech OBD",
  "FLEX Boot/BDM/JTAG",
  "FLEX OBD",
  "Alientech KESS",
  "Alientech K-TAG",
  "Magpro2",
  "MPPS",
  "PCMFlash",
  "Other",
];

const ecuProducers = [
  "Bosch",
  "Continental",
  "Cummins",
  "Delco",
  "Delphi",
  "Denso",
  "Hella",
  "Hitachi",
  "John Deere",
  "Johnson",
  "Lucas",
  "Marelli",
  "Melco",
  "Mitsubishi",
  "Phoenix",
  "Saab",
  "Sagem",
  "Siemens",
  "Temic",
  "Other",
];

const fuelTypes = [
  { id: "diesel", label: "Diesel" },
  { id: "petrol", label: "Petrol" },
];

const powerOptions = [
  { id: "none", name: "No changes", price: 0, note: "" },
  { id: "stage1", name: "Stage 1", price: 50, note: "" },
  { id: "stage1_5", name: "Stage 1.5", price: 80, note: "Max Power. DPF must be removed!" },
  { id: "stage2", name: "Stage 2", price: 150, note: "Exhaust without DPF and CAT is must. Intake/Intercooler upgrade is recommended" },
  { id: "stage3", name: "Stage 3", price: 0, note: "Price is individual" },
  { id: "gearbox_tuning", name: "Gearbox Tuning", price: 100, note: "" },
];

const additionalOptions = [
  { id: "dpf", name: "DPF / FAP OFF", price: 30, note: "" },
  { id: "egr", name: "EGR OFF", price: 10, note: "" },
  { id: "adblue", name: "AdBlue / SCR OFF", price: 10, note: "" },
  { id: "lambda", name: "Lambda / Decat / O2 OFF", price: 10, note: "" },
  { id: "swirl", name: "Swirl Flaps OFF", price: 10, note: "" },
  { id: "dtc", name: "DTC OFF", price: 10, note: "" },
  { id: "throttle", name: "Throttle body / Shut off valve", price: 10, note: "" },
  { id: "speedlimit", name: "Speed Limit OFF", price: 10, note: "" },
  { id: "frontgrill", name: "Front Grill Shutter", price: 10, note: "" },
  { id: "popcorn", name: "Popcorn / Hard Cut Limiter", price: 10, note: "" },
  { id: "flames", name: "Aggressive Hard Cut Limiter With Flames", price: 50, note: "" },
  { id: "deeploud", name: "Aggressive Deep Loud Exhaust Sound At Idle", price: 10, note: "" },
  { id: "exhaustflap", name: "Exhaust Flap In The Muffler OFF", price: 10, note: "" },
  { id: "launch", name: "Launch Control", price: 20, note: "" },
  { id: "hotstart", name: "Hot Start Fix", price: 10, note: "" },
  { id: "maf", name: "MAF OFF", price: 10, note: "" },
  { id: "startstop", name: "Start Stop Disable", price: 10, note: "" },
  { id: "immo", name: "IMMO OFF", price: 20, note: "Contact us before uploading the file" },
  { id: "e85", name: "E85 Flexfuel", price: 60, note: "" },
];

/* ───────────────────── Steps config ───────────────────── */

const steps = [
  { n: 1, label: "Vehicle Type", icon: Car },
  { n: 2, label: "Vehicle Details", icon: FileText },
  { n: 3, label: "Services", icon: Wrench },
  { n: 4, label: "ECU Details", icon: Cpu },
  { n: 5, label: "Client Details", icon: User },
  { n: 6, label: "Upload & Submit", icon: Upload },
];

/* ═══════════════════════════════════════════════════════ */

export default function NewTicketPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [vehicleType, setVehicleType] = useState("car");

  // Step 2 — vehicle dropdowns
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [brandId, setBrandId] = useState("");
  const [brandName, setBrandName] = useState("");
  const [modelId, setModelId] = useState("");
  const [modelName, setModelName] = useState("");
  const [engineId, setEngineId] = useState("");
  const [engineName, setEngineName] = useState("");
  const [year, setYear] = useState("");
  const [gearbox, setGearbox] = useState("");
  const [vin, setVin] = useState("");
  const [customEntry, setCustomEntry] = useState(false);
  const [customBrand, setCustomBrand] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customEngine, setCustomEngine] = useState("");

  // Step 3 — services
  const [fuelType, setFuelType] = useState("");
  const [selectedPower, setSelectedPower] = useState("");
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);

  // Step 4 — ECU
  const [ecuProducer, setEcuProducer] = useState("");
  const [ecuType, setEcuType] = useState("");
  const [readingTool, setReadingTool] = useState("");
  const [hardwareNo, setHardwareNo] = useState("");
  const [softwareNo, setSoftwareNo] = useState("");
  const [ecuUpdateNo, setEcuUpdateNo] = useState("");

  // Step 5 — client details
  const [clientName, setClientName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [priority, setPriority] = useState("urgent");

  // Step 6 — file & notes
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  /* ─── Load data ─── */

  useEffect(() => {
    supabase
      .from("vehicle_brands")
      .select("id, name, vehicle_types")
      .order("name")
      .then(({ data }) => setBrands(data || []));
  }, []);

  // Auto-fill client name from profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();
            if (name) setClientName(name);
          }
        });
    });
  }, []);

  // Reset brand selection when vehicle type changes
  useEffect(() => {
    setBrandId(""); setBrandName("");
    setModelId(""); setModelName("");
    setEngineId(""); setEngineName("");
    setModels([]); setEngines([]);
  }, [vehicleType]);

  useEffect(() => {
    if (!brandId) { setModels([]); return; }
    supabase
      .from("vehicle_models")
      .select("id, name")
      .eq("brand_id", brandId)
      .order("name")
      .then(({ data }) => setModels(data || []));
    setModelId(""); setModelName("");
    setEngineId(""); setEngineName("");
    setEngines([]);
  }, [brandId]);

  useEffect(() => {
    if (!modelId) { setEngines([]); return; }
    supabase
      .from("vehicle_engines")
      .select("id, name, fuel_type, displacement, power_hp")
      .eq("model_id", modelId)
      .order("name")
      .then(({ data }) => setEngines(data || []));
    setEngineId(""); setEngineName("");
  }, [modelId]);

  /* ─── Price calculation ─── */

  const powerPrice = powerOptions.find((p) => p.id === selectedPower)?.price || 0;
  const additionalPrice = additionalOptions
    .filter((a) => selectedAdditional.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const totalPrice = powerPrice + additionalPrice;

  /* ─── Helpers ─── */

  function toggleAdditional(id: string) {
    setSelectedAdditional((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleBrandChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setBrandId(id);
    setBrandName(brands.find((b) => String(b.id) === id)?.name || "");
  }

  function handleModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setModelId(id);
    setModelName(models.find((m) => String(m.id) === id)?.name || "");
  }

  function handleEngineChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setEngineId(id);
    const eng = engines.find((e: any) => String(e.id) === id);
    setEngineName(
      eng
        ? `${eng.name} ${eng.power_hp ? eng.power_hp + "HP" : ""} (${eng.fuel_type || ""})`.trim()
        : ""
    );
  }

  const finalBrand = customEntry ? customBrand : brandName;
  const finalModel = customEntry ? customModel : modelName;
  const finalEngine = customEntry ? customEngine : engineName;

  // Filter brands by selected vehicle type
  const filteredBrands = brands.filter((b: any) => {
    if (!b.vehicle_types || b.vehicle_types.length === 0) return vehicleType === "car";
    return b.vehicle_types.includes(vehicleType);
  });

  function canProceed(s: number): boolean {
    switch (s) {
      case 1: return !!vehicleType;
      case 2: return !!(finalBrand && finalModel);
      case 3: return !!fuelType && !!selectedPower;
      case 4: return !!readingTool && !!ecuProducer;
      case 5: return !!clientName;
      case 6: return !!file;
      default: return false;
    }
  }

  /* ─── Submit ─── */

  async function handleSubmit() {
    if (!finalBrand || !finalModel) { setError("Select vehicle make and model."); return; }
    if (!selectedPower || selectedPower === "none") {
      if (selectedAdditional.length === 0) { setError("Select at least one service."); return; }
    }
    if (!file) { setError("Upload your ECU file."); return; }

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Build service list
      const allServices: { name: string; price: number }[] = [];
      if (selectedPower && selectedPower !== "none") {
        const pw = powerOptions.find((p) => p.id === selectedPower);
        if (pw) allServices.push({ name: pw.name, price: pw.price });
      }
      for (const id of selectedAdditional) {
        const opt = additionalOptions.find((a) => a.id === id);
        if (opt) allServices.push({ name: opt.name, price: opt.price });
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          vehicle_type: vehicleType,
          vehicle_make: finalBrand,
          vehicle_model: finalModel,
          vehicle_engine: finalEngine,
          vehicle_year: year,
          vehicle_gearbox: gearbox,
          vehicle_fuel: fuelType,
          vehicle_vin: vin,
          ecu_producer: ecuProducer,
          ecu_type: ecuType,
          ecu_hardware_no: hardwareNo,
          ecu_software_no: softwareNo,
          ecu_update_no: ecuUpdateNo,
          reading_tool: readingTool,
          client_name: clientName || "Client",
          vehicle_plate: vehiclePlate,
          priority,
          price_eur: totalPrice,
          total_credits: totalPrice,
          notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const items = allServices.map((s) => ({
        order_id: order.id,
        product_name: s.name,
        price_credits: s.price,
      }));
      if (items.length > 0) await supabase.from("order_items").insert(items);

      const filePath = `${user.id}/${order.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("ticket-files")
        .upload(filePath, file);
      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Still redirect but warn — ticket was created
      }
      const { data: urlData } = supabase.storage
        .from("ticket-files")
        .getPublicUrl(filePath);
      const { error: fileInsertError } = await supabase.from("ticket_files").insert({
        order_id: order.id,
        uploaded_by: user.id,
        file_name: file.name,
        file_path: filePath,
        file_url: urlData?.publicUrl || filePath,
        file_size: file.size,
        file_type: "original",
      });
      if (fileInsertError) {
        console.error("File record error:", fileInsertError);
      }

      // Admin skips payment — redirect directly
      window.location.href = `/admin/tickets/${order.id}`;
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setLoading(false);
    }
  }

  /* ─── Styles ─── */

  const inputClass =
    "w-full h-[46px] px-4 border border-[#e2e8f0] text-sm font-medium text-[#1a202c] bg-white focus:outline-none focus:border-[#d41920] transition-colors";
  const selectClass = inputClass + " appearance-none cursor-pointer";
  const labelClass =
    "block text-[11px] font-semibold text-[#718096] uppercase tracking-[0.1em] mb-2";

  /* ═══════════════════════════════════════════════════════ */

  return (
    <div className="max-w-[900px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/admin/tickets"
          className="w-9 h-9 bg-white border border-[#e2e8f0] flex items-center justify-center hover:bg-[#f7fafc] transition-colors"
        >
          <ArrowLeft size={16} className="text-[#4a5568]" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a202c]">
            New Ticket
          </h1>
          <p className="text-sm text-[#718096]">
            Submit your ECU file for tuning
          </p>
        </div>
      </div>

      {/* Steps bar */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight size={14} className="text-[#718096] shrink-0" />
            )}
            <button
              onClick={() => s.n < step && setStep(s.n)}
              disabled={s.n > step}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                step === s.n
                  ? "bg-[#d41920] text-white"
                  : step > s.n
                  ? "bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100"
                  : "bg-white border border-[#e2e8f0] text-[#718096] cursor-not-allowed opacity-60"
              }`}
            >
              {step > s.n ? (
                <CheckCircle2 size={14} />
              ) : (
                <s.icon size={14} />
              )}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">Step {s.n}</span>
            </button>
          </div>
        ))}
        {totalPrice > 0 && (
          <div className="ml-auto bg-[#d41920] text-white px-4 py-2 text-sm font-extrabold">
            {totalPrice.toFixed(2)} &euro;
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm mb-5 flex items-center gap-2">
          <X size={16} /> {error}
        </div>
      )}

      {/* ════════ Step 1: Vehicle Type ════════ */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h2 className="text-lg font-bold text-[#1a202c] mb-1">
            Select type of vehicle
          </h2>
          <p className="text-sm text-[#718096] mb-6">
            Choose the category that best matches your vehicle.
          </p>

          <div className="grid gap-2">
            {vehicleTypes.map((vt) => {
              const active = vehicleType === vt.id;
              return (
                <button
                  key={vt.id}
                  onClick={() => setVehicleType(vt.id)}
                  className={`flex items-center gap-4 px-5 py-4 border-2 text-left transition-all ${
                    active
                      ? "border-[#d41920] bg-red-50/50"
                      : "border-[#e2e8f0] hover:border-[#cbd5e0] bg-white"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      active
                        ? "border-[#d41920]"
                        : "border-[#cbd5e0]"
                    }`}
                  >
                    {active && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#d41920]" />
                    )}
                  </div>
                  <vt.icon
                    size={20}
                    className={active ? "text-[#d41920]" : "text-[#718096]"}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      active ? "text-[#1a202c]" : "text-[#4a5568]"
                    }`}
                  >
                    {vt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed(1)}
              className="px-6 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              Continue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ════════ Step 2: Vehicle Details ════════ */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h2 className="text-lg font-bold text-[#1a202c] mb-1">
            Provide general details about the vehicle
          </h2>
          <p className="text-sm text-[#718096] mb-5">
            Select your vehicle from the database or enter details manually.
          </p>

          {/* Custom entry toggle */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setCustomEntry(!customEntry)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                customEntry ? "bg-[#d41920]" : "bg-[#cbd5e0]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  customEntry ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-[#4a5568]">
              Custom vehicle entry
            </span>
          </div>

          {customEntry ? (
            /* Custom free-text fields */
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Brand *</label>
                <input
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="e.g. Audi"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Model / Generation *</label>
                <input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g. A3 2020 ->"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Engine</label>
                <input
                  value={customEngine}
                  onChange={(e) => setCustomEngine(e.target.value)}
                  placeholder="e.g. 2.0 TDI 150HP"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Select --</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Gearbox</label>
                <select
                  value={gearbox}
                  onChange={(e) => setGearbox(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Select --</option>
                  {gearboxOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>VIN Code</label>
                <input
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Optional"
                  maxLength={17}
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            /* Database dropdowns */
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Brand *</label>
                <select
                  value={brandId}
                  onChange={handleBrandChange}
                  className={selectClass}
                >
                  <option value="">Select make</option>
                  {filteredBrands.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Model / Generation *</label>
                <select
                  value={modelId}
                  onChange={handleModelChange}
                  disabled={!brandId}
                  className={selectClass + (brandId ? "" : " opacity-50")}
                >
                  <option value="">Select model</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Engine</label>
                <select
                  value={engineId}
                  onChange={handleEngineChange}
                  disabled={!modelId}
                  className={selectClass + (modelId ? "" : " opacity-50")}
                >
                  <option value="">Select engine</option>
                  {engines.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} {e.displacement || ""}{" "}
                      {e.power_hp ? e.power_hp + "HP" : ""} ({e.fuel_type || ""})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Select --</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Gearbox</label>
                <select
                  value={gearbox}
                  onChange={(e) => setGearbox(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Select --</option>
                  {gearboxOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>VIN Code</label>
                <input
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Optional"
                  maxLength={17}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 text-sm font-semibold text-[#4a5568] hover:text-[#1a202c]"
            >
              &larr; Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceed(2)}
              className="px-6 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              Continue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ════════ Step 3: Power & Additional Options ════════ */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h2 className="text-lg font-bold text-[#1a202c] mb-1">
            Select power and additional options
          </h2>
          <p className="text-sm text-[#718096] mb-6">
            Choose the engine type, power level, and any additional services.
          </p>

          {/* Engine / Fuel Type */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#1a202c] mb-3">
              Engine Type
            </h3>
            <div className="flex gap-4">
              {fuelTypes.map((ft) => {
                const active = fuelType === ft.id;
                return (
                  <button
                    key={ft.id}
                    onClick={() => setFuelType(ft.id)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        active ? "border-[#d41920]" : "border-[#cbd5e0]"
                      }`}
                    >
                      {active && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#d41920]" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        active ? "text-[#1a202c]" : "text-[#4a5568]"
                      }`}
                    >
                      {ft.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Power Option (radio) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1a202c]">
                Power option
              </h3>
              <span className="text-xs font-semibold text-[#718096] uppercase">
                Price
              </span>
            </div>

            {!fuelType ? (
              <div className="flex items-center gap-2 text-amber-600 text-sm py-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold">
                  !
                </span>
                Please select an engine type first.
              </div>
            ) : (
              <div className="space-y-1">
                {powerOptions.map((po) => {
                  const active = selectedPower === po.id;
                  return (
                    <button
                      key={po.id}
                      onClick={() => setSelectedPower(po.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 border-2 text-left transition-all ${
                        active
                          ? "border-[#d41920] bg-red-50/50"
                          : "border-[#e2e8f0] hover:border-[#cbd5e0] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            active
                              ? "border-[#d41920]"
                              : "border-[#cbd5e0]"
                          }`}
                        >
                          {active && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#d41920]" />
                          )}
                        </div>
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              active
                                ? "text-[#1a202c]"
                                : "text-[#4a5568]"
                            }`}
                          >
                            {po.name}
                          </span>
                          {po.note && (
                            <p className="text-xs text-[#d41920] mt-0.5 italic">
                              {po.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#1a202c]">
                        {po.price > 0
                          ? `${po.price.toFixed(2)} \u20AC`
                          : po.id === "stage3"
                          ? "Contact"
                          : "0.00 \u20AC"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Additional Options (checkboxes) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1a202c]">
                Additional options
              </h3>
              <span className="text-xs font-semibold text-[#718096] uppercase">
                Price
              </span>
            </div>

            {!selectedPower ? (
              <div className="flex items-center gap-2 text-amber-600 text-sm py-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold">
                  !
                </span>
                Please select a power option first.
              </div>
            ) : (
              <div className="space-y-1">
                {additionalOptions.map((ao) => {
                  const checked = selectedAdditional.includes(ao.id);
                  return (
                    <button
                      key={ao.id}
                      onClick={() => toggleAdditional(ao.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 border-2 text-left transition-all ${
                        checked
                          ? "border-[#d41920] bg-red-50/50"
                          : "border-[#e2e8f0] hover:border-[#cbd5e0] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                            checked
                              ? "border-[#d41920] bg-[#d41920]"
                              : "border-[#cbd5e0]"
                          }`}
                        >
                          {checked && (
                            <CheckCircle2
                              size={14}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              checked
                                ? "text-[#1a202c]"
                                : "text-[#4a5568]"
                            }`}
                          >
                            {ao.name}
                          </span>
                          {ao.note && (
                            <p className="text-xs text-[#d41920] mt-0.5 italic">
                              {ao.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#1a202c]">
                        {ao.price.toFixed(2)} &euro;
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-[#e2e8f0]">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 text-sm font-semibold text-[#4a5568] hover:text-[#1a202c]"
            >
              &larr; Back
            </button>
            <div className="flex items-center gap-4">
              {totalPrice > 0 && (
                <div className="text-right">
                  <p className="text-xs text-[#718096]">Total</p>
                  <p className="text-xl font-extrabold text-[#1a202c]">
                    {totalPrice.toFixed(2)} &euro;
                  </p>
                </div>
              )}
              <button
                onClick={() => setStep(4)}
                disabled={!canProceed(3)}
                className="px-6 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Step 4: ECU Details ════════ */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h2 className="text-lg font-bold text-[#1a202c] mb-1">
            Enter ECU details of the vehicle
          </h2>
          <p className="text-sm text-[#718096] mb-5">
            Provide your ECU information. Reading tool is required.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ECU Reading Tool *</label>
              <select
                value={readingTool}
                onChange={(e) => setReadingTool(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Select --</option>
                {readingTools.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>ECU Software Number</label>
              <input
                value={softwareNo}
                onChange={(e) => setSoftwareNo(e.target.value)}
                placeholder="e.g. 500775"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>ECU Producer *</label>
              <select
                value={ecuProducer}
                onChange={(e) => setEcuProducer(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Select --</option>
                {ecuProducers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>ECU Hardware Number</label>
              <input
                value={hardwareNo}
                onChange={(e) => setHardwareNo(e.target.value)}
                placeholder="e.g. 05E907309A"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>ECU Type</label>
              <input
                value={ecuType}
                onChange={(e) => setEcuType(e.target.value)}
                placeholder="e.g. EDC17C46"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>ECU Update / Part Number</label>
              <input
                value={ecuUpdateNo}
                onChange={(e) => setEcuUpdateNo(e.target.value)}
                placeholder="e.g. 0_E2NT87"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 text-sm font-semibold text-[#4a5568] hover:text-[#1a202c]"
            >
              &larr; Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all"
            >
              Continue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ════════ Step 5: Client Details ════════ */}
      {step === 5 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h2 className="text-lg font-bold text-[#1a202c] mb-1">
            Enter your client details
          </h2>
          <p className="text-sm text-[#718096] mb-5">
            Provide your name and vehicle plate number.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Customer Tom"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Vehicle Plate Number</label>
              <input
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="e.g. XXX:999"
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Ticket Priority</label>
              <div className="flex gap-2">
                {[
                  { id: "urgent", label: "0-1 hour", desc: "Fastest", color: "text-red-600" },
                  { id: "normal", label: "2-5 hours", desc: "Standard", color: "text-blue-600" },
                  { id: "low", label: "5-10 hours", desc: "Economy", color: "text-zinc-600" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`flex-1 px-4 py-3 border-2 text-left transition-all ${
                      priority === p.id
                        ? "border-[#d41920] bg-red-50/50"
                        : "border-[#e2e8f0] hover:border-[#cbd5e0]"
                    }`}
                  >
                    <div className={`text-sm font-bold ${priority === p.id ? "text-[#d41920]" : p.color}`}>
                      {p.label}
                    </div>
                    <div className="text-[11px] text-[#718096] mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 text-sm font-semibold text-[#4a5568] hover:text-[#1a202c]"
            >
              &larr; Back
            </button>
            <button
              onClick={() => setStep(6)}
              disabled={!canProceed(5)}
              className="px-6 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              Continue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ════════ Step 6: Upload & Submit ════════ */}
      {step === 6 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h2 className="text-lg font-bold text-[#1a202c] mb-5">
            Upload original ECU file
          </h2>

          {/* File upload */}
          <div className="mb-5">
            <label className={labelClass}>Original ECU File *</label>
            <label
              className={`flex flex-col items-center justify-center w-full h-[150px] border-2 border-dashed cursor-pointer transition-all ${
                file
                  ? "border-emerald-400 bg-emerald-50/50"
                  : "border-[#cbd5e0] bg-[#f7fafc] hover:border-[#d41920]"
              }`}
            >
              {file ? (
                <div className="text-center">
                  <FileText
                    size={26}
                    className="text-emerald-500 mx-auto mb-2"
                  />
                  <p className="text-sm font-semibold text-[#1a202c]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[#718096] mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="text-xs text-red-500 font-semibold mt-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload
                    size={26}
                    className="text-[#718096] mx-auto mb-2"
                  />
                  <p className="text-sm font-medium text-[#4a5568]">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-[#718096] mt-1">
                    .bin, .ori, .mod, .hex, .zip and more — max 15MB
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept=".bin,.ori,.mod,.hex,.tun,.zip,.rar,.7z,.txt,.csv,.pdf,.bak,.frf,.sgm,.mtx,.map,.bdm,.dtc"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className={labelClass}>Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              rows={3}
              className="w-full px-4 py-3 border border-[#e2e8f0] text-sm text-[#1a202c] bg-white focus:outline-none focus:border-[#d41920] resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-[#f7fafc] border border-[#e2e8f0] p-5 mb-5">
            <h3 className="text-sm font-bold text-[#1a202c] mb-3">
              Order Summary
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#718096]">Vehicle</span>
                <span className="font-medium text-[#1a202c]">
                  {finalBrand} {finalModel} {finalEngine}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#718096]">Type</span>
                <span className="font-medium text-[#1a202c] capitalize">
                  {vehicleType}
                </span>
              </div>
              {year && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#718096]">Year</span>
                  <span className="font-medium text-[#1a202c]">{year}</span>
                </div>
              )}
              {fuelType && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#718096]">Fuel</span>
                  <span className="font-medium text-[#1a202c] capitalize">
                    {fuelType}
                  </span>
                </div>
              )}
            </div>

            {/* Services */}
            <div className="space-y-2 mb-4 pt-3 border-t border-[#e2e8f0]">
              <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide">
                Services
              </p>
              {selectedPower && selectedPower !== "none" && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#718096]">
                    {powerOptions.find((p) => p.id === selectedPower)?.name}
                  </span>
                  <span className="font-mono font-medium text-[#1a202c]">
                    {powerPrice.toFixed(2)} &euro;
                  </span>
                </div>
              )}
              {additionalOptions
                .filter((a) => selectedAdditional.includes(a.id))
                .map((a) => (
                  <div key={a.id} className="flex justify-between text-sm">
                    <span className="text-[#718096]">{a.name}</span>
                    <span className="font-mono font-medium text-[#1a202c]">
                      {a.price.toFixed(2)} &euro;
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex justify-between pt-3 border-t border-[#e2e8f0]">
              <span className="font-bold text-[#1a202c]">Total</span>
              <span className="text-xl font-extrabold text-[#d41920]">
                {totalPrice.toFixed(2)} &euro;
              </span>
            </div>
          </div>

          {/* Terms & Privacy */}
          <div className="space-y-3 mb-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 mt-0.5 border-2 flex items-center justify-center shrink-0 transition-all ${
                  agreePrivacy
                    ? "border-[#d41920] bg-[#d41920]"
                    : "border-[#cbd5e0] group-hover:border-[#d41920]"
                }`}
                onClick={() => setAgreePrivacy(!agreePrivacy)}
              >
                {agreePrivacy && (
                  <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm text-[#4a5568]">
                I agree with the{" "}
                <a href="#" className="text-[#d41920] font-semibold hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 mt-0.5 border-2 flex items-center justify-center shrink-0 transition-all ${
                  agreeTerms
                    ? "border-[#d41920] bg-[#d41920]"
                    : "border-[#cbd5e0] group-hover:border-[#d41920]"
                }`}
                onClick={() => setAgreeTerms(!agreeTerms)}
              >
                {agreeTerms && (
                  <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm text-[#4a5568]">
                I agree with the{" "}
                <a href="#" className="text-[#d41920] font-semibold hover:underline">
                  Terms &amp; Conditions
                </a>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(5)}
              className="px-5 py-2.5 text-sm font-semibold text-[#4a5568] hover:text-[#1a202c]"
            >
              &larr; Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !file || !agreeTerms || !agreePrivacy}
              className="px-8 py-3 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-bold transition-all disabled:opacity-50"
            >
              {loading
                ? "Submitting..."
                : `Submit & Pay ${totalPrice.toFixed(2)} \u20AC`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
