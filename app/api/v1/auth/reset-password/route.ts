import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // 2. Verify the OTP
    if (user.otpSecret !== otp) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // 3. Check if OTP is expired
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // 4. Check if new password is the same as the old one
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json({ error: "New password cannot be the same as your current password." }, { status: 400 });
    }

    // 5. Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 6. Save new password and clear the OTP fields so it can't be reused
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        otpSecret: null,
        otpExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true, message: "Password reset successful" }, { status: 200 });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}