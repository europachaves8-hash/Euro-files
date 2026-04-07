"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

const COUNTRIES = [
  "Portugal", "Brazil", "Spain", "France", "Germany", "Italy",
  "United Kingdom", "Netherlands", "Belgium", "Switzerland",
  "Austria", "Poland", "Czech Republic", "Romania", "Sweden",
  "Norway", "Denmark", "Finland", "Ireland", "Luxembourg",
  "Greece", "Hungary", "Bulgaria", "Croatia", "Slovakia",
  "Slovenia", "Lithuania", "Latvia", "Estonia", "Cyprus",
  "Malta", "Turkey", "United States", "Canada", "Other",
];

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [company, setCompany] = useState("");
  const [companyReg, setCompanyReg] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!agreePrivacy) { setError("You must agree to the Privacy Policy."); return; }
    if (!isPrivate && !company.trim()) { setError("Company is required for business accounts."); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName, last_name: lastName, phone, is_private: isPrivate,
          company: isPrivate ? null : company, company_reg: isPrivate ? null : companyReg,
          vat_number: isPrivate ? null : vatNumber, country, city, address, zip,
        },
      },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }
    window.location.href = "/auth/login?registered=true";
  }

  const inputClass = "w-full h-[46px] px-4 border-2 border-[#e2e8f0] text-sm font-medium text-[#1a202c] focus:outline-none focus:border-[#d41920] transition-colors bg-white";
  const labelClass = "block text-xs font-semibold text-[#4a5568] mb-2 uppercase tracking-wider";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  return (
    <div className="min-h-dvh flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-1 bg-[#1e1e1e] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(212,25,32,0.08),transparent_70%)]" />
        <div className="relative z-10 max-w-[380px] px-8">
          <Link href="/" className="inline-block mb-10">
            <img src="/assets/images/logo.png" alt="EUROFILES" className="h-16" />
          </Link>
          <h2 className="text-[2.5rem] font-extrabold text-white leading-[1.1] mb-4 tracking-[-0.03em]">
            Join the EuroFiles Network
          </h2>
          <p className="text-[#718096] text-[15px] leading-[1.7]">
            Create your account and get access to professional ECU tuning files from our expert team.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-[480px]">
          <div className="lg:hidden mb-6">
            <Link href="/">
              <img src="/assets/images/logo.png" alt="EUROFILES" className="h-12" />
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1a202c] mb-1 tracking-tight">Register</h1>
          <p className="text-sm text-[#718096] mb-6">Create your free account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm mb-5 font-medium">{error}</div>
          )}

          <form onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="John" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Surname *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Doe" className={inputClass} />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 912 345 678" className={inputClass} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-4 h-4 accent-[#d41920] cursor-pointer" />
              <span className="text-sm text-[#4a5568] font-medium">I am a private person</span>
            </label>

            {!isPrivate && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className={labelClass}>Company *</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} required={!isPrivate} placeholder="Company" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Reg. Number</label>
                  <input value={companyReg} onChange={(e) => setCompanyReg(e.target.value)} placeholder="Optional" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>VAT Number</label>
                  <input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="Optional" className={inputClass} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Country *</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} required className={selectClass}>
                  <option value="">Select</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="City" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_130px] gap-4 mb-5">
              <div>
                <label className={labelClass}>Address *</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Street and number" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Zip *</label>
                <input value={zip} onChange={(e) => setZip(e.target.value)} required placeholder="1000-001" className={inputClass} />
              </div>
            </div>

            <div className="border-t border-[#e2e8f0] mb-5" />

            <div className="mb-4">
              <label className={labelClass}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="your@email.com" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-1">
              <div>
                <label className={labelClass}>Password *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 6 chars" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirm *</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Repeat" className={inputClass} />
              </div>
            </div>
            <p className="text-[11px] text-[#718096] mb-5">Must be at least 6 characters long</p>

            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} className="w-4 h-4 accent-[#d41920] cursor-pointer" />
              <span className="text-sm text-[#4a5568] font-medium">
                I agree with this site <a href="#" className="text-[#d41920] font-semibold hover:underline">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading} className="w-full h-[48px] bg-[#d41920] hover:bg-[#b01018] text-white font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer">
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#718096]">
            Already have an account? <Link href="/auth/login" className="text-[#d41920] font-semibold hover:underline">Sign In</Link>
          </p>
          <p className="mt-2 mb-6 text-center">
            <Link href="/" className="text-xs text-[#718096] hover:text-[#4a5568]">&larr; Back to site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
