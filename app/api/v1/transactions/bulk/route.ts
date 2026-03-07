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
    const { transactionIds, categoryId } = body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0 || !categoryId) {
      return NextResponse.json({ error: "Missing required fields: transactionIds and categoryId are required." }, { status: 400 });
    }

    // Update all selected transactions in one efficient database query
    const updated = await prisma.transaction.updateMany({
      where: {
        id: { in: transactionIds },
        businessId: business.id // Security check: ensures a user can only update their own transactions
      },
      data: {
        categoryId: categoryId
      }
    });

    return NextResponse.json({ 
      message: `Successfully updated ${updated.count} transactions!`,
      count: updated.count
    }, { status: 200 });

  } catch (error) {
    console.error("Bulk Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}