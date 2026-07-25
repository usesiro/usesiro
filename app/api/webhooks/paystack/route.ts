import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Paystack webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Only handle charge.success
    if (event.event === "charge.success") {
      const data = event.data;

      await prisma.payment.upsert({
        where: { reference: data.reference },
        create: {
          reference: data.reference,
          email: data.customer?.email || "unknown",
          amount: data.amount,
          status: "SUCCESS",
          channel: data.channel || null,
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        },
        update: {
          status: "SUCCESS",
          channel: data.channel || null,
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        },
      });
    }

    // Paystack expects a 200 response
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Paystack webhook error:", error);
    // Still return 200 to prevent Paystack retries on app errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
