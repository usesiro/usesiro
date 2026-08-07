import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { Resend } from "resend";
import { z } from "zod";
import {
  consumeRateLimit,
  escapeHtml,
  getClientIdentifier,
  readLimitedJsonBody,
  safeEmailHeader,
} from "@/lib/public-form-security";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY); 

const contactSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  topic: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(5_000),
}).strict();

function rateLimited(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(req: Request) {
  try {
    const ipLimit = consumeRateLimit({
      scope: "contact:ip",
      identifier: getClientIdentifier(req),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipLimit.allowed) return rateLimited(ipLimit.retryAfterSeconds);

    const body = await readLimitedJsonBody(req);
    if (!body.success) {
      return NextResponse.json(
        { error: body.error },
        { status: body.status },
      );
    }

    const validation = contactSchema.safeParse(body.data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid form submission.", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { fullName, email, topic, message } = validation.data;
    const emailLimit = consumeRateLimit({
      scope: "contact:email",
      identifier: email,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!emailLimit.allowed) return rateLimited(emailLimit.retryAfterSeconds);

    // 2. Save the message to the database
    const newContact = await prisma.contactMessage.create({
      data: {
        fullName,
        email,
        topic,
        message,
      },
    });

    // 3. Send emails
    try {
      // A. Alert info@usesiro.com
      await resend.emails.send({
        from: 'Siro System <info@usesiro.com>',
        to: 'info@usesiro.com', 
        subject: safeEmailHeader(`New Contact Message: ${topic} from ${fullName}`),
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h3>New Message via usesiro.com</h3>
            <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
            <br/>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        `
      });

      // B. Auto-response to the User
      await resend.emails.send({
        from: 'Siro <info@usesiro.com>',
        to: email,
        subject: "We've received your message",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
            <p>Hi ${escapeHtml(fullName.split(" ")[0])},</p>
            <p>Thank you for reaching out to us. This is to confirm that we've received your message regarding <strong>${escapeHtml(topic)}</strong>.</p>
            <p>Our team is currently reviewing your enquiry and we will get back to you as soon as possible (usually within 24-48 hours).</p>
            <p>In the meantime, feel free to explore our <a href="https://usesiro.com/help" style="color: #4F75FF; text-decoration: none; font-weight: bold;">Help Center</a> for quick answers to common questions.</p>
            <br/>
            <p>Best regards,<br/>The Siro Team</p>
          </div>
        `
      });

      console.log("Contact emails (alert + auto-response) fired successfully.");
    } catch (emailError) {
      console.error("Failed to send contact emails:", emailError);
    }

    // 4. Return Success
    return NextResponse.json(
      { success: true, message: "Message sent successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
