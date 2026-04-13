import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    console.log(`[BOOKING] Fetching slots for ${date}`);

    const bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        startTime: true,
      },
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("[BOOKING] Fetch error:", error.message);
    return NextResponse.json({ 
      error: "Internal server error. Prisma model may still be refreshing.",
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, companyName, notes, startTime, endTime } = body;

    console.log(`[BOOKING] New booking request from ${email}`);

    // 1. Validation
    if (!fullName || !email || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // 2. Create in Database
    try {
      const newBooking = await prisma.booking.create({
        data: {
          fullName,
          email,
          companyName: companyName || null,
          notes: notes || null,
          startTime: startDate,
          endTime: endDate,
        },
      });

      console.log(`[BOOKING] Saved to DB with ID: ${newBooking.id}`);

      // 3. Send Email Notification
      // We do this in the background if possible, or just wait for it.
      try {
        console.log(`[BOOKING] Triggering Resend for ${email}`);
        
        const emailResult = await resend.emails.send({
          from: 'Siro Booking <info@usesiro.com>',
          to: 'info@usesiro.com',
          subject: `New Demo Booking: ${fullName} (${companyName || 'N/A'})`,
          html: `
            <div style="font-family: sans-serif; color: #111827;">
              <h2 style="color: #2F6EF6;">New Demo Booking Scheduled</h2>
              <p><strong>Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Company:</strong> ${companyName || 'Not specified'}</p>
              <p><strong>Scheduled Time:</strong> ${startDate.toLocaleString('en-GB', { timeZone: 'UTC' })} (UTC)</p>
              <br/>
              <p><strong>Additional Notes:</strong></p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                ${notes || 'No notes provided'}
              </div>
              <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
                Sent via Siro Internal Booking System.
              </p>
            </div>
          `,
        });

        console.log(`[BOOKING] Resend status:`, emailResult);
      } catch (emailError: any) {
        console.error("[BOOKING] Resend error:", emailError.message);
        // We don't fail the request if email fails, as the booking is already saved.
      }

      return NextResponse.json({ 
        success: true, 
        message: "Booking confirmed!",
        booking: newBooking 
      }, { status: 201 });

    } catch (dbError: any) {
      if (dbError.code === 'P2002') {
        return NextResponse.json({ 
          error: "This slot has already been booked. Please choose another time." 
        }, { status: 409 });
      }
      console.error("[BOOKING] DB Error:", dbError.message);
      throw dbError;
    }

  } catch (error: any) {
    console.error("[BOOKING] General error:", error.message);
    return NextResponse.json({ 
      error: "Internal server error. Please try again.",
      details: error.message 
    }, { status: 500 });
  }
}
