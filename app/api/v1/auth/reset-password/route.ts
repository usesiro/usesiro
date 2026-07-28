import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/logger";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const MAX_OTP_ATTEMPTS = 5;

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = resetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { email, otp, newPassword } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Generic message to prevent enumeration
    if (!user || !user.otpSecret || !user.otpExpiresAt) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    // Check attempt limit
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpSecret: null, otpExpiresAt: null, otpAttempts: 0 }
      });
      return NextResponse.json({ error: "Too many failed attempts. Please request a new code." }, { status: 429 });
    }

    // Check expiry
    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // Timing-safe OTP comparison
    const otpMatch = user.otpSecret.length === otp.length &&
      crypto.timingSafeEqual(Buffer.from(user.otpSecret), Buffer.from(otp));

    if (!otpMatch) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } }
      });
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    // Check if same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json({ error: "New password cannot be the same as your current password." }, { status: 400 });
    }

    // Hash and save
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        otpSecret: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    await recordAuditLog({
      userId: user.id,
      action: "AUTH.PASSWORD_RESET",
      status: "SUCCESS",
      details: { email: user.email }
    });

    return NextResponse.json({ success: true, message: "Password reset successful" }, { status: 200 });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
