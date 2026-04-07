import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const publicClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const mode = process.env.PAYPAL_MODE || "NOT SET";
  const hasSecret = !!process.env.PAYPAL_CLIENT_SECRET;

  return NextResponse.json({
    mode,
    clientIdPrefix: clientId.substring(0, 8) + "...",
    publicClientIdPrefix: publicClientId.substring(0, 8) + "...",
    hasSecret,
    apiUrl: mode === "live" || clientId.startsWith("AUC")
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com",
  });
}
