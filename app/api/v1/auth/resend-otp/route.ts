import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";
import { recordAuditLog } from "@/lib/logger";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "../_lib/rate-limit";
import { readLimitedJsonBody } from "@/lib/public-form-security";

const resend = new Resend(process.env.RESEND_API_KEY);
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// 1. Zod Schema: We only need the email for a resend
const resendSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(254).transform((value) => value.toLowerCase()),
  newEmail: z.string().trim().email("Invalid email format").max(254).transform((value) => value.toLowerCase()).optional(),
  password: z.string().min(1).max(128).optional(),
});

export async function POST(request: Request) {
  try {
    const ipLimit = await checkRateLimit(
      `resend-otp:ip:${getClientIp(request)}`,
      5,
      RATE_LIMIT_WINDOW_MS
    );
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } }
      );
    }

    const body = await readLimitedJsonBody(request, 8 * 1024);
    if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });

    // 2. Validate Payload
    const validation = resendSchema.safeParse(body.data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, newEmail, password } = validation.data;
    const emailLimit = await checkRateLimit(
      `resend-otp:email:${email.trim().toLowerCase()}`,
      3,
      RATE_LIMIT_WINDOW_MS
    );
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } }
      );
    }

    // 3. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || user.isVerified) {
      return NextResponse.json(
        { message: "If the account requires verification, a new code was sent." },
        { status: 200 },
      );
    }

    let deliveryEmail = email;
    if (newEmail && newEmail !== email) {
      if (!password || !(await bcrypt.compare(password, user.passwordHash))) {
        return NextResponse.json({ error: "Unable to update email address." }, { status: 400 });
      }
      const emailInUse = await prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } });
      if (emailInUse) {
        return NextResponse.json({ error: "That email address is already in use." }, { status: 400 });
      }
      deliveryEmail = newEmail;
    }

    // 4. Generate a NEW 6-digit OTP and set expiration (5 mins)
    const newOtpCode = crypto.randomInt(100000, 1000000).toString();
    const newOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 5. Update the user in the database
    await prisma.user.update({
      where: { email },
      data: {
        ...(deliveryEmail !== email && { email: deliveryEmail }),
        otpSecret: newOtpCode,
        otpExpiresAt: newOtpExpiresAt,
        otpAttempts: 0,
      },
    });

    // 6. Send the NEW OTP via Resend
    await resend.emails.send({
      from: "Siro <no-reply@usesiro.com>", 
      to: deliveryEmail,
      subject: "Your New Siro Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1e40af;">Verify your email</h2>
          <p>You requested a new verification code. Use the code below to complete your registration:</p>
          <h1 style="background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 5px; color: #1e40af; border-radius: 5px;">
            ${newOtpCode}
          </h1>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    });

    // 7. Record Audit Log
    await recordAuditLog({
      userId: user.id,
      action: "AUTH.RESEND_OTP",
      status: "SUCCESS",
      details: { email: deliveryEmail }
    });

    return NextResponse.json(
      { message: "New OTP sent successfully!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
