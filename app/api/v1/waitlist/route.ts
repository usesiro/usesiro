import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';
import { z } from "zod";
import {
  consumeRateLimit,
  escapeHtml,
  getClientIdentifier,
  readLimitedJsonBody,
} from "@/lib/public-form-security";

const resend = new Resend(process.env.RESEND_API_KEY);

const waitlistSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  businessName: z.string().trim().min(2).max(150),
  businessType: z.enum(["SOLE_PROPRIETORSHIP", "PARTNERSHIP", "LIMITED_LIABILITY"]),
  state: z.string().trim().min(2).max(100),
  referralSource: z.enum(["TWITTER", "LINKEDIN", "INSTAGRAM", "FRIEND", "SEARCH", "OTHER"])
    .optional()
    .or(z.literal(""))
    .transform((value) => value || "OTHER"),
}).strict();

function rateLimited(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  try {
    const ipLimit = await consumeRateLimit({
      scope: "waitlist:ip",
      identifier: getClientIdentifier(request),
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!ipLimit.allowed) return rateLimited(ipLimit.retryAfterSeconds);

    const body = await readLimitedJsonBody(request);
    if (!body.success) {
      return NextResponse.json({ error: body.error }, { status: body.status });
    }

    const validation = waitlistSchema.safeParse(body.data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid form submission.", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { fullName, email, businessName, businessType, state, referralSource } = validation.data;
    const emailLimit = await consumeRateLimit({
      scope: "waitlist:email",
      identifier: email,
      limit: 3,
      windowMs: 24 * 60 * 60 * 1000,
    });
    if (!emailLimit.allowed) return rateLimited(emailLimit.retryAfterSeconds);

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
        referralSource,
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
            <p>Hi ${escapeHtml(fullName.split(" ")[0])},</p>
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
