import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "../_lib/rate-limit";
import { readLimitedJsonBody } from "@/lib/public-form-security";

const resend = new Resend(process.env.RESEND_API_KEY);
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(req: Request) {
  try {
    const ipLimit = await checkRateLimit(
      `forgot-password:ip:${getClientIp(req)}`,
      5,
      RATE_LIMIT_WINDOW_MS
    );
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } }
      );
    }

    const body = await readLimitedJsonBody(req, 8 * 1024);
    if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });
    const validation = forgotPasswordSchema.safeParse(body.data);

    if (!validation.success) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const { email } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();
    const emailLimit = await checkRateLimit(
      `forgot-password:email:${normalizedEmail}`,
      3,
      RATE_LIMIT_WINDOW_MS
    );
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } }
      );
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Security best practice: Don't reveal if the email exists or not
      // Just return success even if we didn't find them, to prevent email scraping
      return NextResponse.json({ success: true, message: "If that email is registered, an OTP was sent." }, { status: 200 });
    }

    // 2. Generate a secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // 3. Set expiration time (e.g., 10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Save the OTP to the user's database record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpSecret: otp,
        otpExpiresAt: expiresAt,
        otpAttempts: 0,
      },
    });

    // 5. Send the email via Resend
    try {
      await resend.emails.send({
        from: 'Siro Security <info@usesiro.com>',
        to: normalizedEmail,
        subject: `Your Siro Password Reset Code: ${otp}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h2>Reset your Siro Password</h2>
            <p>We received a request to reset the password for your Siro account.</p>
            <p>Your 6-digit verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 4px; color: #4F75FF; background: #f3f4f6; padding: 12px; border-radius: 8px; text-align: center;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `
      });
      console.log(`Password reset OTP sent to ${normalizedEmail}`);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return NextResponse.json({ error: "Failed to send email. Try again later." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
