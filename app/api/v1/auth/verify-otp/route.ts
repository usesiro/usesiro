import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/logger";
import { z } from "zod";
import crypto from "crypto";
import { reserveOtpAttempt } from "../_lib/otp-attempt";
import { readLimitedJsonBody } from "@/lib/public-form-security";
import { checkRateLimit, getClientIp } from "../_lib/rate-limit";

const MAX_OTP_ATTEMPTS = 5;

const verifySchema = z.object({
  email: z.string().trim().email("Invalid email format").max(254).transform((value) => value.toLowerCase()),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export async function POST(request: Request) {
  try {
    const ipLimit = await checkRateLimit(`verify-otp:ip:${getClientIp(request)}`, 20, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } },
      );
    }

    const body = await readLimitedJsonBody(request, 8 * 1024);
    if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });

    const validation = verifySchema.safeParse(body.data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;
    const emailLimit = await checkRateLimit(`verify-otp:email:${email}`, 10, 15 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Generic message to prevent email enumeration
    if (!user || !user.otpSecret || !user.otpExpiresAt) {
      return NextResponse.json({ error: "Invalid or expired code. Please try again." }, { status: 400 });
    }

    // Check expiry
    const now = new Date();
    if (user.otpExpiresAt <= now) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // Atomically reserve one attempt. The conditional update prevents concurrent
    // requests from all passing a stale attempt-count check.
    const reservedAttempt = await reserveOtpAttempt(
      user.id,
      user.otpSecret,
      now,
      MAX_OTP_ATTEMPTS
    );

    if (reservedAttempt === null) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { otpSecret: true, otpAttempts: true },
      });

      if (
        currentUser?.otpSecret === user.otpSecret &&
        currentUser.otpAttempts >= MAX_OTP_ATTEMPTS
      ) {
        await prisma.user.updateMany({
          where: {
            id: user.id,
            otpSecret: user.otpSecret,
            otpAttempts: { gte: MAX_OTP_ATTEMPTS },
          },
          data: { otpSecret: null, otpExpiresAt: null, otpAttempts: 0 },
        });

        await recordAuditLog({
          userId: user.id,
          action: "AUTH.OTP_LOCKED",
          status: "FAILURE",
          details: { email: user.email, reason: "Max attempts exceeded" },
        });

        return NextResponse.json(
          { error: "Too many failed attempts. Please request a new code." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    // Timing-safe comparison
    const otpMatch = user.otpSecret.length === otp.length &&
      crypto.timingSafeEqual(Buffer.from(user.otpSecret), Buffer.from(otp));

    if (!otpMatch) {
      const attempts = reservedAttempt;
      const remaining = Math.max(0, MAX_OTP_ATTEMPTS - attempts);

      if (remaining === 0) {
        await prisma.user.updateMany({
          where: {
            id: user.id,
            otpSecret: user.otpSecret,
            otpAttempts: { gte: MAX_OTP_ATTEMPTS },
          },
          data: { otpSecret: null, otpExpiresAt: null, otpAttempts: 0 },
        });
      }

      await recordAuditLog({
        userId: user.id,
        action: "AUTH.OTP_FAILED",
        status: "FAILURE",
        details: { email: user.email, attempts },
      });

      return NextResponse.json({
        error: remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : "Too many failed attempts. Please request a new code."
      }, { status: remaining > 0 ? 400 : 429 });
    }

    // Success — verify user and clear OTP
    const verified = await prisma.user.updateMany({
      where: {
        id: user.id,
        otpSecret: user.otpSecret,
        otpExpiresAt: { gt: new Date() },
        otpAttempts: { lte: MAX_OTP_ATTEMPTS },
      },
      data: {
        isVerified: true,
        otpSecret: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    if (verified.count === 0) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

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
