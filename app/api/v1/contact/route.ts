import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY); 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, topic, message } = body;

    // 1. Basic Validation
    if (!fullName || !email || !topic || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

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
        subject: `New Contact Message: ${topic} from ${fullName}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h3>New Message via usesiro.com</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Topic:</strong> ${topic}</p>
            <br/>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
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
            <p>Hi ${fullName.split(' ')[0]},</p>
            <p>Thank you for reaching out to us. This is to confirm that we've received your message regarding <strong>${topic}</strong>.</p>
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