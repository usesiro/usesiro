import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const EXPECTED_AMOUNT_KOBO = 999900; // ₦9,999

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Call Paystack's verify endpoint
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (
      !paystackData.status ||
      paystackData.data?.status !== "success" ||
      paystackData.data?.amount !== EXPECTED_AMOUNT_KOBO
    ) {
      // Persist as failed if it exists
      await prisma.payment.upsert({
        where: { reference },
        create: {
          reference,
          email: paystackData.data?.customer?.email || "unknown",
          amount: paystackData.data?.amount || 0,
          status: "FAILED",
        },
        update: { status: "FAILED" },
      });

      return NextResponse.json(
        { verified: false, error: "Payment verification failed or amount mismatch" },
        { status: 400 }
      );
    }

    // Payment is verified — persist to DB
    const payment = await prisma.payment.upsert({
      where: { reference },
      create: {
        reference,
        email: paystackData.data.customer.email,
        amount: paystackData.data.amount,
        status: "SUCCESS",
        channel: paystackData.data.channel || null,
        paidAt: paystackData.data.paid_at ? new Date(paystackData.data.paid_at) : new Date(),
      },
      update: {
        status: "SUCCESS",
        channel: paystackData.data.channel || null,
        paidAt: paystackData.data.paid_at ? new Date(paystackData.data.paid_at) : new Date(),
      },
    });

    return NextResponse.json({ verified: true, payment });
  } catch (error: any) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
