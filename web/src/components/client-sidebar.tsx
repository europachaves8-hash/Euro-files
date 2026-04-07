"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  User,
  ArrowLeft,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/tickets", label: "My Tickets", icon: Ticket },
  { href: "/client/tickets/new", label: "Create Ticket", icon: PlusCircle },
  { href: "/client/profile", label: "Profile", icon: User },
];

export function ClientSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`w-[220px] bg-[#1e1e1e] flex flex-col min-h-[100dvh] shrink-0 ${isOpen ? "fixed inset-y-0 left-0 z-50" : "hidden"} md:relative md:flex md:z-auto`}>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-white/50 hover:text-white md:hidden"
        >
          <X size={20} />
        </button>
        {/* Logo */}
        <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <Link href="/" className="block">
          <img
            src="/assets/images/logo.png"
            alt="EUROFILES"
            className="w-full h-auto object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4">
        <p className="px-3 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em]">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/client/tickets" &&
              pathname.startsWith("/client/tickets") &&
              !pathname.includes("/new"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium mb-0.5 transition-all ${
                isActive
                  ? "bg-[#d41920] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={17} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}

        {/* Quick Links */}
        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em]">
          Quick Links
        </p>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={17} strokeWidth={1.8} />
          Back to Website
        </Link>
      </nav>

      {/* Working Hours */}
      <div className="px-5 pb-3">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-2">
          Working Hours
        </p>
        <div className="text-[11px] text-white/40 space-y-0.5">
          <div className="flex justify-between">
            <span>Mon-Fri</span><span className="text-white/60">09:00 - 20:00</span>
          </div>
          <div className="flex justify-between">
            <span>Saturday</span><span className="text-white/60">09:00 - 16:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#d41920]">Sunday</span><span className="text-[#d41920]">Closed</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/5 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/40 hover:text-[#d41920] hover:bg-white/5 transition-all w-full cursor-pointer"
        >
          <LogOut size={17} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
