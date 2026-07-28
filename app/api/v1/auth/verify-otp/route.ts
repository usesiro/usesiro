import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/logger";
import { z } from "zod";
import crypto from "crypto";

const MAX_OTP_ATTEMPTS = 5;

const verifySchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = verifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Generic message to prevent email enumeration
    if (!user || !user.otpSecret || !user.otpExpiresAt) {
      return NextResponse.json({ error: "Invalid or expired code. Please try again." }, { status: 400 });
    }

    // Check if too many attempts
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      // Invalidate the OTP entirely
      await prisma.user.update({
        where: { id: user.id },
        data: { otpSecret: null, otpExpiresAt: null, otpAttempts: 0 }
      });

      await recordAuditLog({
        userId: user.id,
        action: "AUTH.OTP_LOCKED",
        status: "FAILURE",
        details: { email: user.email, reason: "Max attempts exceeded" }
      });

      return NextResponse.json({ error: "Too many failed attempts. Please request a new code." }, { status: 429 });
    }

    // Check expiry
    if (user.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // Timing-safe comparison
    const otpMatch = user.otpSecret.length === otp.length &&
      crypto.timingSafeEqual(Buffer.from(user.otpSecret), Buffer.from(otp));

    if (!otpMatch) {
      // Increment attempts
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } }
      });

      await recordAuditLog({
        userId: user.id,
        action: "AUTH.OTP_FAILED",
        status: "FAILURE",
        details: { email: user.email, attempts: user.otpAttempts + 1 }
      });

      const remaining = MAX_OTP_ATTEMPTS - (user.otpAttempts + 1);
      return NextResponse.json({
        error: remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : "Too many failed attempts. Please request a new code."
      }, { status: 400 });
    }

    // Success — verify user and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpSecret: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    await recordAuditLog({
      userId: user.id,
      action: "AUTH.VERIFY_SUCCESS",
      status: "SUCCESS",
      details: { email: user.email }
    });

    return NextResponse.json(
      { message: "Account verified successfully!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
