import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email },
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
      },
    });

    // 5. Send the email via Resend
    try {
      await resend.emails.send({
        from: 'Siro Security <info@usesiro.com>',
        to: email, 
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
      console.log(`Password reset OTP sent to ${email}`);
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