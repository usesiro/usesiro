import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const EXPECTED_AMOUNT_KOBO = 999900;
const ACCESS_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
const verifySchema = z.object({ reference: z.string().trim().min(8).max(120) }).strict();

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 });

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, jwtSecret);
    if (typeof payload.userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = verifySchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payment reference" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reference = validation.data.reference;
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" },
    );
    const paystackData = await paystackRes.json();
    const paymentData = paystackData.data;
    const customerEmail = paymentData?.customer?.email?.trim().toLowerCase();

    if (
      !paystackRes.ok ||
      !paystackData.status ||
      paymentData?.status !== "success" ||
      paymentData?.amount !== EXPECTED_AMOUNT_KOBO ||
      paymentData?.currency !== "NGN" ||
      customerEmail !== user.email.toLowerCase()
    ) {
      return NextResponse.json(
        { verified: false, error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const paidAt = paymentData.paid_at ? new Date(paymentData.paid_at) : new Date();
    const payment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`;

      const existingReference = await tx.payment.findUnique({ where: { reference } });
      if (existingReference?.userId && existingReference.userId !== user.id) {
        throw new Error("REFERENCE_OWNED");
      }

      const latestAccess = await tx.payment.findFirst({
        where: { userId: user.id, status: "SUCCESS", accessEndsAt: { gt: new Date() } },
        orderBy: { accessEndsAt: "desc" },
        select: { accessEndsAt: true },
      });
      const accessStartsAt = latestAccess?.accessEndsAt ?? paidAt;
      const accessEndsAt = new Date(accessStartsAt.getTime() + ACCESS_PERIOD_MS);

      return tx.payment.upsert({
        where: { reference },
        create: {
          reference,
          userId: user.id,
          email: user.email,
          amount: paymentData.amount,
          status: "SUCCESS",
          channel: paymentData.channel || null,
          paidAt,
          accessStartsAt,
          accessEndsAt,
        },
        update: {
          userId: user.id,
          email: user.email,
          amount: paymentData.amount,
          status: "SUCCESS",
          channel: paymentData.channel || null,
          paidAt,
          accessStartsAt: existingReference?.accessStartsAt ?? accessStartsAt,
          accessEndsAt: existingReference?.accessEndsAt ?? accessEndsAt,
        },
      });
    });

    return NextResponse.json({
      verified: true,
      payment: { paidAt: payment.paidAt, accessEndsAt: payment.accessEndsAt },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "REFERENCE_OWNED") {
      return NextResponse.json({ error: "Payment reference is already in use" }, { status: 409 });
    }
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
