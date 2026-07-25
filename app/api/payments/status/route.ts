import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for a successful payment
    const payment = await prisma.payment.findFirst({
      where: {
        email: user.email,
        status: "SUCCESS",
      },
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json({
      isPro: !!payment,
      payment: payment
        ? {
            reference: payment.reference,
            amount: payment.amount,
            paidAt: payment.paidAt,
            channel: payment.channel,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Payment status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
