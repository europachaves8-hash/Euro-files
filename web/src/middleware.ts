import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // DEV ONLY: bypass auth for local development
  if (process.env.DEV_BYPASS_AUTH === "true" && process.env.NODE_ENV === "development") {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions =
              process.env.NODE_ENV === "development"
                ? { ...options, secure: false, sameSite: "lax" as const }
                : options;
            supabaseResponse.cookies.set(name, value, cookieOptions);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Rotas de admin requerem autenticacao + role ADMIN
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    const role = user.app_metadata?.userrole;
    if (role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  // Rotas de client requerem autenticacao
  if (path.startsWith("/client")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  // Rotas de auth: se ja logado, redirecionar
  if (path.startsWith("/auth/") && user) {
    const role = user.app_metadata?.userrole;
    const url = request.nextUrl.clone();
    url.pathname = role === "ADMIN" ? "/admin/dashboard" : "/client/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/auth/:path*"],
};
