import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Zod Schema: We strictly validate the incoming data
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 2. Validate Payload
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password, firstName } = validation.data;

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 4. Hash the password (Security step)
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Generate a 6-digit OTP and set expiration (5 mins)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 6. Save the user to the database
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        otpSecret: otpCode,
        otpExpiresAt,
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

    return NextResponse.json(
      { message: "Registration successful, OTP sent!", userId: newUser.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}