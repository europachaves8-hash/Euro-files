import { AdminLayoutShell } from "@/components/admin-layout-shell";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
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

    if (!user || user.app_metadata?.userrole !== "ADMIN") {
      redirect("/auth/login");
    }
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
