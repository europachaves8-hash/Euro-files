"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex font-[Outfit,sans-serif]">
      {/* Branding — lado esquerdo */}
      <div className="hidden lg:flex flex-1 bg-[#060609] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(230,57,86,0.12),transparent_70%)]" />
        <div className="relative z-10 max-w-[340px]">
          <h2 className="text-[2.8rem] font-extrabold text-white leading-[1.05] mb-5 tracking-[-0.04em]">
            Professional
            <br />
            ECU <span className="text-[#e63956]">Tuning</span>
            <br />
            Files
          </h2>
          <p className="text-zinc-500 text-[15px] leading-[1.7] max-w-[300px]">
            12+ years delivering dyno and road tested chiptuning files,
            individually developed by our team.
          </p>
        </div>
      </div>

      {/* Form — lado direito */}
      <div className="flex-1 bg-[#0a0a14] flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-[380px]">
          {/* Logo */}
          <div className="mb-14">
            <Link href="/home.html" className="inline-block">
              <span className="text-[1.75rem] font-extrabold text-white tracking-[-0.04em]">
                Euro<span className="text-[#e63956]">Files</span>
              </span>
            </Link>
            <p className="text-zinc-600 text-[13px] mt-2 font-medium">
              Sign in to your account
            </p>
          </div>

          {registered && (
            <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-2xl px-5 py-4 text-emerald-400 text-[13px] mb-8 font-medium">
              Conta criada com sucesso. Faca login.
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-7">
              <label
                htmlFor="login-email"
                className="block text-[11px] font-semibold text-zinc-400 mb-3 tracking-[0.15em] uppercase"
              >
                EMAIL
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="auth-input w-full h-[52px] px-5 rounded-2xl text-[15px] font-medium"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="login-password"
                  className="text-[11px] font-semibold text-zinc-400 tracking-[0.15em] uppercase"
                >
                  PASSWORD
                </label>
                <button
                  type="button"
                  className="text-[12px] text-zinc-600 hover:text-[#e63956] transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="auth-input w-full h-[52px] px-5 rounded-2xl text-[15px] font-medium"
                placeholder="Enter your password"
              />
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-10 text-center">
            <p className="text-[13px] text-zinc-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-[#e63956] hover:text-[#ff5c75] font-semibold transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-5 text-center">
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
