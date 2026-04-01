"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!agreePrivacy) {
      setError("Voce deve concordar com a Privacy Policy");
      return;
    }

    if (!isPrivate && !company.trim()) {
      setError("Company is required for business accounts");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          is_private: isPrivate,
          company: isPrivate ? null : company,
          company_reg: isPrivate ? null : companyReg,
          vat_number: isPrivate ? null : vatNumber,
          country,
          city,
          address,
          zip,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/auth/login?registered=true");
  }

  const inputClass =
    "auth-input w-full h-[48px] px-5 rounded-2xl text-[14px] font-medium";
  const labelClass =
    "block text-[11px] font-semibold text-zinc-400 mb-2 tracking-[0.15em] uppercase";
  const selectClass =
    "auth-input w-full h-[48px] px-4 rounded-2xl text-[14px] font-medium appearance-none cursor-pointer";

  return (
    <div className="min-h-dvh flex font-[Outfit,sans-serif]">
      {/* Branding — lado esquerdo */}
      <div className="hidden lg:flex flex-1 bg-[#060609] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(230,57,86,0.12),transparent_70%)]" />
        <div className="relative z-10 max-w-[340px]">
          <h2 className="text-[2.8rem] font-extrabold text-white leading-[1.05] mb-5 tracking-[-0.04em]">
            Join the
            <br />
            <span className="text-[#e63956]">EuroFiles</span>
            <br />
            Network
          </h2>
          <p className="text-zinc-500 text-[15px] leading-[1.7] max-w-[300px]">
            Create your account and get access to professional ECU tuning files
            from our expert team.
          </p>
        </div>
      </div>

      {/* Form — lado direito */}
      <div className="flex-1 bg-[#0a0a14] flex items-center justify-center px-6 py-12 sm:px-8 overflow-y-auto">
        <div className="w-full max-w-[480px]">
          {/* Logo */}
          <div className="mb-10">
            <Link href="/home.html" className="inline-block">
              <span className="text-[1.75rem] font-extrabold text-white tracking-[-0.04em]">
                Euro<span className="text-[#e63956]">Files</span>
              </span>
            </Link>
            <p className="text-zinc-600 text-[13px] mt-2 font-medium">
              Create your account
            </p>
          </div>

          <form onSubmit={handleRegister}>
            {/* ── Personal Info ── */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="reg-first-name" className={labelClass}>
                  Name *
                </label>
                <input
                  id="reg-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="John"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="reg-last-name" className={labelClass}>
                  Surname *
                </label>
                <input
                  id="reg-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Doe"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="reg-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+351 912 345 678"
                className={inputClass}
              />
            </div>

            {/* ── Private person toggle ── */}
            <div className="mb-5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-[#12121e] text-[#e63956] focus:ring-[#e63956]/30 cursor-pointer"
                />
                <span className="text-[13px] text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">
                  I am a private person
                </span>
              </label>
            </div>

            {/* ── Company fields (hidden if private) ── */}
            {!isPrivate && (
              <div className="mb-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="reg-company" className={labelClass}>
                      Company *
                    </label>
                    <input
                      id="reg-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required={!isPrivate}
                      placeholder="Company name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-company-reg" className={labelClass}>
                      Reg. Number
                    </label>
                    <input
                      id="reg-company-reg"
                      type="text"
                      value={companyReg}
                      onChange={(e) => setCompanyReg(e.target.value)}
                      placeholder="Optional"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-vat" className={labelClass}>
                      VAT Number
                    </label>
                    <input
                      id="reg-vat"
                      type="text"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      placeholder="Optional"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Address ── */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="reg-country" className={labelClass}>
                  Country *
                </label>
                <select
                  id="reg-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="reg-city" className={labelClass}>
                  City *
                </label>
                <input
                  id="reg-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Your city"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_140px] gap-4 mb-7">
              <div>
                <label htmlFor="reg-address" className={labelClass}>
                  Address *
                </label>
                <input
                  id="reg-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Street and number"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="reg-zip" className={labelClass}>
                  Zip *
                </label>
                <input
                  id="reg-zip"
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  placeholder="1000-001"
                  className={inputClass}
                />
              </div>
            </div>

            {/* ── Separator ── */}
            <div className="border-t border-zinc-800/50 mb-7" />

            {/* ── Credentials ── */}
            <div className="mb-5">
              <label htmlFor="reg-email" className={labelClass}>
                E-Mail *
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
                placeholder="your@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-1">
              <div>
                <label htmlFor="reg-password" className={labelClass}>
                  Password *
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label htmlFor="reg-confirm-password" className={labelClass}>
                  Confirm *
                </label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-600 mb-6">
              Must be at least 6 characters long
            </p>

            {/* ── Privacy Policy ── */}
            <div className="mb-7">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-[#12121e] text-[#e63956] focus:ring-[#e63956]/30 cursor-pointer"
                />
                <span className="text-[13px] text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">
                  I agree with this site{" "}
                  <a
                    href="/privacy"
                    className="text-[#e63956] hover:text-[#ff5c75] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/8 border border-red-500/12 rounded-2xl px-5 py-4 text-red-400 text-[13px] mb-6 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#e63956] hover:bg-[#d42e4a] active:scale-[0.98] text-white font-bold rounded-2xl text-[15px] transition-all duration-150 disabled:opacity-50 cursor-pointer tracking-tight"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 text-center">
            <p className="text-[13px] text-zinc-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#e63956] hover:text-[#ff5c75] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 mb-8 text-center">
            <Link
              href="/home.html"
              className="text-[12px] text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
