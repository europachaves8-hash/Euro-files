"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Menu } from "lucide-react";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col bg-[#f5f5f5] overflow-auto">
        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center px-4 py-3 bg-[#1e1e1e]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-white/70 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <img
            src="/assets/images/logo.png"
            alt="EUROFILES"
            className="h-6 ml-3 object-contain"
          />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
