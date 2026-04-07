import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save to database
    const { error: dbError } = await supabase.from("contacts").insert({
      name,
      email,
      subject,
      message,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 }
      );
    }

    // Send notification email to support
    await resend.emails.send({
      from: "EUROFILES <noreply@eurofiles.es>",
      to: "support@eurofiles.es",
      subject: `New Contact: ${subject || "No subject"} — ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; font-size: 18px; margin: 0; font-weight: 700;">New Contact Message</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 80px; vertical-align: top;">From</td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Email</td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><a href="mailto:${email}" style="color: #d41920;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Subject</td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${subject || "—"}</td>
              </tr>
            </table>
            <div style="background: #f9fafb; border-left: 3px solid #d41920; padding: 16px 20px; border-radius: 0 6px 6px 0;">
              <p style="color: #1f2937; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://eurofiles.es/admin/contacts" style="display: inline-block; background: #d41920; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Reply in Dashboard</a>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 12px 32px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">EUROFILES — Professional ECU Tuning Files</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
