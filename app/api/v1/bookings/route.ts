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

const resend = new Resend(process.env.RESEND_API_KEY);

const bookingDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()),
  "Invalid booking date.",
);

const bookingSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  companyName: z.string().trim().max(150).optional().or(z.literal("")),
  notes: z.string().trim().max(2_000).optional().or(z.literal("")),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
}).strict().superRefine((value, context) => {
  const start = new Date(value.startTime);
  const end = new Date(value.endTime);
  if (end <= start) {
    context.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after start time." });
  }
  if (end.getTime() - start.getTime() > 2 * 60 * 60 * 1000) {
    context.addIssue({ code: "custom", path: ["endTime"], message: "Booking duration is too long." });
  }
});

function rateLimited(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateValidation = bookingDateSchema.safeParse(searchParams.get("date"));

    if (!dateValidation.success) {
      return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
    }
    const date = dateValidation.data;

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
  } catch (error) {
    console.error("[BOOKING] Fetch error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ipLimit = consumeRateLimit({
      scope: "booking:ip",
      identifier: getClientIdentifier(req),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipLimit.allowed) return rateLimited(ipLimit.retryAfterSeconds);

    const body = await readLimitedJsonBody(req);
    if (!body.success) {
      return NextResponse.json({ error: body.error }, { status: body.status });
    }

    const validation = bookingSchema.safeParse(body.data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid booking request.", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { fullName, email, companyName, notes, startTime, endTime } = validation.data;
    const emailLimit = consumeRateLimit({
      scope: "booking:email",
      identifier: email,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!emailLimit.allowed) return rateLimited(emailLimit.retryAfterSeconds);

    console.log(`[BOOKING] New booking request from ${email}`);

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
          subject: safeEmailHeader(`New Demo Booking: ${fullName} (${companyName || "N/A"})`),
          html: `
            <div style="font-family: sans-serif; color: #111827;">
              <h2 style="color: #2F6EF6;">New Demo Booking Scheduled</h2>
              <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Company:</strong> ${escapeHtml(companyName || "Not specified")}</p>
              <p><strong>Scheduled Time:</strong> ${escapeHtml(startDate.toLocaleString('en-GB', { timeZone: 'UTC' }))} (UTC)</p>
              <br/>
              <p><strong>Additional Notes:</strong></p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                ${escapeHtml(notes || "No notes provided")}
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

  } catch (error) {
    console.error("[BOOKING] General error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
