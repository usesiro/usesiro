import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { z } from "zod";
import { recordAuditLog } from "@/lib/logger";
import crypto from "crypto";
import { readLimitedJsonBody } from "@/lib/public-form-security";
import { checkRateLimit, getClientIp } from "../_lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Zod Schema: We strictly validate the incoming data
const registerSchema = z.object({
  email: z.string().trim().email("Invalid email format").transform((value) => value.toLowerCase()),
  password: z.string().min(12, "Password must be at least 12 characters").max(128),
  firstName: z.string().trim().min(1, "First name is required").max(80),
}).strict();

export async function POST(request: Request) {
  try {
    const ipLimit = await checkRateLimit(`register:ip:${getClientIp(request)}`, 10, 60 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } },
      );
    }

    const body = await readLimitedJsonBody(request, 8 * 1024);
    if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });

    // 2. Validate Payload
    const validation = registerSchema.safeParse(body.data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, firstName } = validation.data;
    const emailLimit = await checkRateLimit(`register:email:${email}`, 5, 24 * 60 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } },
      );
    }

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 4. Hash the password (Security step)
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Generate a 6-digit OTP and set expiration (5 mins)
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Public registration must never grant an administrative role.
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName, // Fixed: Added this line to save the first name
        otpSecret: otpCode,
        otpExpiresAt,
        role: "USER",
      },
    });

    // 7. Send the OTP via Resend
    // 6. Send OTP Email via Resend
    await resend.emails.send({
      from: "Siro <no-reply@usesiro.com>", // MUST be an email at your verified domain
      to: email, // This will now work for ANY email address (like your gmail)
      subject: "Your Siro Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1e40af;">Verify your email</h2>
          <p>Thank you for joining Siro. Use the code below to complete your registration:</p>
          <h1 style="background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 5px; color: #1e40af; border-radius: 5px;">
            ${otpCode}
          </h1>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    });

    // 8. Record Audit Log (Compliance)
    await recordAuditLog({
      userId: newUser.id,
      action: "AUTH.SIGNUP",
      status: "SUCCESS",
      details: { email: newUser.email, role: newUser.role }
    });

    return NextResponse.json(
      { message: "Registration successful, OTP sent!", userId: newUser.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
