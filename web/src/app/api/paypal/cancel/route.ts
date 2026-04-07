import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  // User cancelled payment — redirect back to tickets
  if (orderId) {
    return NextResponse.redirect(`${origin}/client/tickets/${orderId}?payment=cancelled`);
  }

  return NextResponse.redirect(`${origin}/client/tickets`);
}
