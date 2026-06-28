import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";
import { recordAuditLog } from "@/lib/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Zod Schema: We only need the email for a resend
const resendSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 2. Validate Payload
    const validation = resendSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // 3. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "User is already verified" }, { status: 400 });
    }

    // 4. Generate a NEW 6-digit OTP and set expiration (5 mins)
    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 5. Update the user in the database
    await prisma.user.update({
      where: { email },
      data: {
        otpSecret: newOtpCode,
        otpExpiresAt: newOtpExpiresAt,
      },
    });

    // 6. Send the NEW OTP via Resend
    await resend.emails.send({
      from: "Siro <no-reply@usesiro.com>", 
      to: email, 
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
      details: { email: user.email }
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