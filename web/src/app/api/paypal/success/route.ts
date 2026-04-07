import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getPayPalApi() {
  const mode = process.env.PAYPAL_MODE;
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const isLive = mode === "live" || clientId.startsWith("AUC");
  return isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const auth = Buffer.from(
    `${clientId}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${getPayPalApi()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token"); // PayPal order ID
  const orderId = searchParams.get("order_id"); // Our order ID

  if (!token || !orderId) {
    return NextResponse.redirect(`${origin}/client/tickets?error=missing_params`);
  }

  try {
    // Capture the payment
    const accessToken = await getAccessToken();
    const captureRes = await fetch(`${getPayPalApi()}/v2/checkout/orders/${token}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureRes.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
        },
      }
    );

    if (captureData.status === "COMPLETED") {
      // Payment successful — update order
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "pending",
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Determine redirect based on user role
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.userrole;
      const base = role === "ADMIN" ? "/admin" : "/client";

      return NextResponse.redirect(`${origin}${base}/tickets/${orderId}?payment=success`);
    }

    // Payment not completed
    await supabase
      .from("orders")
      .update({ payment_status: "unpaid" })
      .eq("id", orderId);

    return NextResponse.redirect(`${origin}/client/tickets/${orderId}?payment=failed`);
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.redirect(`${origin}/client/tickets?error=capture_failed`);
  }
}
