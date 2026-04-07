"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/dashboard";
  const registered = searchParams.get("registered");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = redirect;
  }

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
            Professional ECU Tuning Files
          </h2>
          <p className="text-[#718096] text-[15px] leading-[1.7]">
            12+ years delivering dyno and road tested chiptuning files, individually developed by our team.
          </p>
          <div className="mt-8 flex gap-6 text-sm text-white/40">
            <div><span className="text-white font-bold text-lg">100+</span><br />Brands</div>
            <div><span className="text-white font-bold text-lg">12+</span><br />Years</div>
            <div><span className="text-white font-bold text-lg">24h</span><br />Support</div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 bg-[#1e1e1e] lg:bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-block">
              <img src="/assets/images/logo.png" alt="EUROFILES" className="h-12" />
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-white lg:text-[#1a202c] mb-1 tracking-tight">
            Sign In
          </h1>
          <p className="text-sm text-[#718096] mb-8">
            Enter your credentials to access your account
          </p>

          {registered && (
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-sm mb-6 font-medium">
              Account created successfully. Please sign in.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-white/60 lg:text-[#4a5568] mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-[48px] px-4 border-2 border-white/20 lg:border-[#e2e8f0] bg-white/10 lg:bg-white text-sm font-medium text-white lg:text-[#1a202c] focus:outline-none focus:border-[#d41920] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-white/60 lg:text-[#4a5568] uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-xs text-[#d41920] font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-[48px] px-4 border-2 border-white/20 lg:border-[#e2e8f0] bg-white/10 lg:bg-white text-sm font-medium text-white lg:text-[#1a202c] focus:outline-none focus:border-[#d41920] transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#d41920] hover:bg-[#b01018] text-white font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#718096]">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-[#d41920] font-semibold hover:underline">
              Register Free
            </Link>
          </p>

          <p className="mt-3 text-center">
            <Link href="/" className="text-xs text-[#718096] hover:text-[#4a5568] transition-colors">
              &larr; Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
