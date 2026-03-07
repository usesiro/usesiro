import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const business = await prisma.business.findUnique({
      where: { userId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const body = await request.json();
    const { transactionId, vatStatus } = body;

    if (!transactionId || !vatStatus) {
      return NextResponse.json({ error: "Missing required fields: transactionId and vatStatus are required." }, { status: 400 });
    }

    // Update the transaction's VAT status
    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: transactionId,
        businessId: business.id // Security check
      },
      data: {
        vatStatus: vatStatus
      }
    });

    return NextResponse.json({ 
      message: "VAT Status updated successfully!",
      transaction: updatedTransaction
    }, { status: 200 });

  } catch (error) {
    console.error("VAT Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}