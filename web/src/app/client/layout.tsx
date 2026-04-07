import { ClientLayoutShell } from "@/components/client-layout-shell";
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

  return <ClientLayoutShell>{children}</ClientLayoutShell>;
}
