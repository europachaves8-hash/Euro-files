import { ClientSidebar } from "@/components/client-sidebar";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bypassAuth =
    process.env.DEV_BYPASS_AUTH === "true" &&
    process.env.NODE_ENV === "development";

  if (!bypassAuth) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }
  }

  return (
    <div className="flex min-h-[100dvh]">
      <ClientSidebar />
      <main className="flex-1 bg-[#f5f5f5] p-6 overflow-auto">{children}</main>
    </div>
  );
}
