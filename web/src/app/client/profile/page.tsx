"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  User,
  Save,
  CheckCircle2,
  Building2,
  Pencil,
  Camera,
} from "lucide-react";

type ProfileData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
  zip: string;
  company: string;
  company_reg: string;
  vat_number: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

export default function ClientProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [email, setEmail] = useState("");
  const [lastSignIn, setLastSignIn] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [company, setCompany] = useState("");
  const [companyReg, setCompanyReg] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [ticketCount, setTicketCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      setLastSignIn(user.last_sign_in_at || "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setCountry(data.country || "");
        setCity(data.city || "");
        setAddress(data.address || "");
        setPostalCode(data.postal_code || data.zip || "");
        setCompany(data.company || "");
        setCompanyReg(data.company_reg || "");
        setVatNumber(data.vat_number || "");
        setIsPrivate(data.is_private || false);
      }

      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setTicketCount(count || 0);

      const { data: orders } = await supabase
        .from("orders")
        .select("price_eur")
        .eq("user_id", user.id);
      const total = (orders || []).reduce(
        (sum: number, o: any) => sum + (Number(o.price_eur) || 0),
        0
      );
      setTotalSpent(total);

      // Load avatar
      const { data: avatarData } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${user.id}/avatar`);
      if (avatarData?.publicUrl) {
        try {
          const res = await fetch(avatarData.publicUrl, { method: "HEAD" });
          if (res.ok) setAvatarUrl(avatarData.publicUrl + "?t=" + Date.now());
        } catch {}
      }

      setLoading(false);
    }
    load();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(`${user.id}/avatar`, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar`);
      setAvatarUrl(data.publicUrl + "?t=" + Date.now());
    }
    setUploadingAvatar(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        country,
        city,
        address,
        postal_code: postalCode,
        company,
        company_reg: companyReg,
        vat_number: vatNumber,
        is_private: isPrivate,
      })
      .eq("id", user.id);

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  function formatDate(d: string) {
    if (!d) return "\u2014";
    return new Date(d).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const inputClass =
    "w-full h-[42px] px-4 border border-[#e2e8f0] text-sm text-[#1a202c] bg-white focus:outline-none focus:border-[#d41920] transition-colors";
  const labelClass =
    "block text-[11px] font-semibold text-[#718096] uppercase tracking-[0.1em] mb-1.5";
  const statLabel = "text-xs text-[#718096]";
  const statValue = "text-sm font-semibold text-[#1a202c] text-right";

  if (loading) {
    return (
      <div className="animate-pulse flex gap-6">
        <div className="w-[280px] shrink-0 space-y-4">
          <div className="h-[320px] bg-gray-100 border border-gray-200" />
          <div className="h-[200px] bg-gray-100 border border-gray-200" />
        </div>
        <div className="flex-1 h-[500px] bg-gray-100 border border-gray-200" />
      </div>
    );
  }

  const fullName =
    `${firstName} ${lastName}`.trim() || email?.split("@")[0] || "User";

  return (
    <div className="flex gap-6 items-start">
      {/* Left column */}
      <div className="w-[280px] shrink-0 space-y-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 bg-[#f0f0f0] rounded-full flex items-center justify-center">
                <User size={40} className="text-[#cbd5e0]" />
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={20} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          </div>
          <h2 className="text-lg font-bold text-[#1a202c]">{fullName}</h2>
          <p className="text-sm text-[#d41920] mt-1">{email}</p>
          {(country || city) && (
            <p className="text-xs text-[#718096] mt-1">
              From {[city, country].filter(Boolean).join(", ")}
            </p>
          )}
          <button
            onClick={() => setEditing(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all"
          >
            <Pencil size={14} />
            Edit
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0]">
          <div className="divide-y divide-[#e2e8f0]">
            <div className="flex items-center justify-between px-5 py-3">
              <span className={statLabel}>User Level</span>
              <span className={statValue}>Registered</span>
            </div>
            {company && (
              <div className="flex items-center justify-between px-5 py-3">
                <span className={statLabel}>Company</span>
                <span className={statValue}>{company}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-3">
              <span className={statLabel}>Total Spent</span>
              <span className={statValue}>{totalSpent.toFixed(2)} EUR</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <span className={statLabel}>Placed Tickets</span>
              <span className={statValue}>{ticketCount}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <span className={statLabel}>Registered At</span>
              <span className={statValue}>
                {formatDate(profile?.created_at || "")}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <span className={statLabel}>Last Login At</span>
              <span className={statValue}>{formatDate(lastSignIn)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="flex-1 min-w-0">
        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm mt-4">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-sm mt-4 flex items-center gap-2">
            <CheckCircle2 size={16} /> Profile saved successfully.
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 space-y-8">
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#1a202c] mb-4">
              <User size={16} className="text-[#718096]" />
              Personal Information
            </h3>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    value={email}
                    disabled
                    className={inputClass + " bg-[#f7fafc] text-[#718096] cursor-not-allowed"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 912 345 678" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Postal Code</label>
                    <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  ["Email", email],
                  ["Name", fullName],
                  ["Phone", phone || "\u2014"],
                  ["Country", country || "\u2014"],
                  ["City", city || "\u2014"],
                  ["Postal Code", postalCode || "\u2014"],
                  ["Address", address || "\u2014"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1">
                    <span className="text-xs text-[#718096]">{label}</span>
                    <span className="text-sm text-[#1a202c] font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#1a202c] mb-4">
              <Building2 size={16} className="text-[#718096]" />
              Company Information
            </h3>

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Company Name</label>
                    <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Company Registration</label>
                    <input value={companyReg} onChange={(e) => setCompanyReg(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>VAT Number</label>
                    <input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Account Type</label>
                    <div className="flex items-center gap-3 h-[42px]">
                      <button
                        onClick={() => setIsPrivate(true)}
                        className={`px-4 py-2 text-sm font-medium border ${
                          isPrivate ? "border-[#d41920] bg-red-50 text-[#d41920]" : "border-[#e2e8f0] text-[#718096]"
                        }`}
                      >
                        Private
                      </button>
                      <button
                        onClick={() => setIsPrivate(false)}
                        className={`px-4 py-2 text-sm font-medium border ${
                          !isPrivate ? "border-[#d41920] bg-red-50 text-[#d41920]" : "border-[#e2e8f0] text-[#718096]"
                        }`}
                      >
                        Business
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  ["Company", company || "\u2014"],
                  ["Registration", companyReg || "\u2014"],
                  ["VAT Number", vatNumber || "\u2014"],
                  ["Account Type", isPrivate ? "Private" : "Business"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1">
                    <span className="text-xs text-[#718096]">{label}</span>
                    <span className="text-sm text-[#1a202c] font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {editing && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#d41920] hover:bg-[#b01018] text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#718096] hover:text-[#1a202c]"
              >
                Cancel
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
