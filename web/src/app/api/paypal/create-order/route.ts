import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getPayPalApi() {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getBaseUrl(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host = request.headers.get("host");
  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }
  return "https://eurofiles.es";
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBase = getPayPalApi();

  console.log("[PayPal] Mode:", process.env.PAYPAL_MODE);
  console.log("[PayPal] API:", apiBase);
  console.log("[PayPal] Client ID starts with:", clientId?.substring(0, 10));

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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

export async function POST(request: Request) {
  try {
    const { order_id, amount, return_url, cancel_url } = await request.json();

    if (!order_id || !amount) {
      return NextResponse.json({ error: "Missing order_id or amount" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const res = await fetch(`${getPayPalApi()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order_id,
            amount: {
              currency_code: "EUR",
              value: Number(amount).toFixed(2),
            },
            description: `EUROFILES Ticket #${order_id.slice(0, 8)}`,
          },
        ],
        application_context: {
          brand_name: "EUROFILES",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: return_url || `${getBaseUrl(request)}/api/paypal/success?order_id=${order_id}`,
          cancel_url: cancel_url || `${getBaseUrl(request)}/api/paypal/cancel?order_id=${order_id}`,
        },
      }),
    });

    const paypalOrder = await res.json();

    if (paypalOrder.id) {
      // Update our order with PayPal order ID
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

      await supabase
        .from("orders")
        .update({
          payment_transaction_id: paypalOrder.id,
          payment_method: "paypal",
        })
        .eq("id", order_id);

      const approvalUrl = paypalOrder.links?.find(
        (l: any) => l.rel === "approve"
      )?.href;

      return NextResponse.json({ id: paypalOrder.id, approval_url: approvalUrl });
    }

    return NextResponse.json({ error: "Failed to create PayPal order", details: paypalOrder }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
