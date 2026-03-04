import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 1. Zod Schema: Ensure we get exactly a 6-digit string
const verifySchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 2. Validate Payload
    const validation = verifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;

    // 3. Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Check if the OTP matches
    if (user.otpSecret !== otp) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    // 5. Check if the OTP has expired
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // 6. Success! Update the user to 'verified' and wipe the OTP from the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpSecret: null,     // Clear the secret so it can't be reused
        otpExpiresAt: null,
      },
    });

    return NextResponse.json(
      { message: "Email verified successfully!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}