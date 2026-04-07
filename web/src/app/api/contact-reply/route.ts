import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase-server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (user.app_metadata as any)?.userrole;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { contactId, toEmail, toName, subject, reply } = await req.json();

    if (!contactId || !toEmail || !reply) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "EUROFILES <onboarding@resend.dev>",
      to: toEmail,
      subject: `Re: ${subject || "Your message"} — EUROFILES`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; font-size: 18px; margin: 0; font-weight: 700; letter-spacing: -0.3px;">EUROFILES</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
              Hi ${toName || "there"},
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Thank you for contacting us. Here is our reply:
            </p>
            <div style="background: #f9fafb; border-left: 3px solid #d41920; padding: 16px 20px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
              <p style="color: #1f2937; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${reply}</p>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
              If you have any further questions, feel free to reply to this email or contact us again through our website.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 16px 32px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">
              EUROFILES — Professional ECU Tuning Files
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Update contact in database
    const now = new Date().toISOString();
    await supabase
      .from("contacts")
      .update({ admin_reply: reply, replied_at: now, is_read: true })
      .eq("id", contactId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact reply error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
