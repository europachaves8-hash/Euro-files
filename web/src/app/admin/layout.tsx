import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh]">
      <AdminSidebar />
      <main className="flex-1 bg-[#f5f5f5] p-6 overflow-auto">{children}</main>
    </div>
  );
}
