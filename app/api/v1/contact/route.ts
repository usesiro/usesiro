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

    // 3. Send the email alert to info@usesiro.com via Resend
    try {
      await resend.emails.send({
        from: 'Siro System <onboarding@resend.dev>', // Keep testing email for now
        to: 'info@usesiro.com', // Change to your actual email if testing restrictions apply
        subject: `New Contact Message: ${topic} from ${fullName}`,
        html: `
          <h3>New Message via usesiro.com</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Topic:</strong> ${topic}</p>
          <br/>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      });
      console.log("Resend email fired successfully.");
    } catch (emailError) {
      console.error("Failed to send email alert:", emailError);
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