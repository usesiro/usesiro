import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, businessName, businessType, state, referralSource } = body;

    // 1. Basic Validation
    if (!fullName || !email || !businessName || !businessType || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Check if email already exists in waitlist
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existingEntry) {
      return NextResponse.json({ error: "This email is already on the waitlist!" }, { status: 409 });
    }

    // 3. Save to Database
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        fullName,
        email,
        businessName,
        businessType,
        state,
        referralSource: referralSource || "OTHER",
      }
    });

    // 4. Send Welcome Email via Resend
    try {
      await resend.emails.send({
        from: 'Siro <info@usesiro.com>',
        to: email,
        subject: "You're on the Siro waitlist",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <p>Hi ${fullName.split(' ')[0]},</p>
            <p>Welcome to Siro. Your spot on the waitlist is confirmed.</p>
            <p>We are working hard to get the platform ready and we'll reach out as soon as your beta access is available. Keep an eye on your inbox.</p>
            <p>Thank you for your interest, we are building this for businesses like yours.</p>
            <br/>
            <p>Muhammed Mustapha<br/>Co-founder, Siro</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send email, but user was saved:", emailError);
      // We don't want to fail the whole request if just the email fails
    }

    return NextResponse.json({ success: true, entry: waitlistEntry }, { status: 201 });

  } catch (error) {
    console.error("Waitlist Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}