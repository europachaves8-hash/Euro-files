import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/";

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const role = user?.app_metadata?.userrole;
      const destination =
        role === "ADMIN" ? "/admin/dashboard" : "/client/dashboard";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Fallback: redirect to login with success message
  return NextResponse.redirect(
    `${origin}/auth/login?message=Email confirmed. Please sign in.`
  );
}
