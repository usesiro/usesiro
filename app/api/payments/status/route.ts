import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

// Founder emails — always have full Pro access
const FOUNDER_EMAILS = [
  "mustymuhd018@gmail.com",
  "olawalemarcus92@gmail.com",
];

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Founders always get Pro access
    if (FOUNDER_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({
        isPro: true,
        payment: { reference: "founder-access", amount: 0, paidAt: new Date().toISOString(), channel: "founder" },
      });
    }

    // Access is tied to the authenticated user and expires after its billing period.
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        status: "SUCCESS",
        accessEndsAt: { gt: new Date() },
      },
      orderBy: { accessEndsAt: "desc" },
    });

    return NextResponse.json({
      isPro: !!payment,
      payment: payment
        ? {
            reference: payment.reference,
            amount: payment.amount,
            paidAt: payment.paidAt,
            accessEndsAt: payment.accessEndsAt,
            channel: payment.channel,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Payment status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
