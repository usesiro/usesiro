import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { recordAuditLog } from "@/lib/logger";

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

    // --- NEW: Record Audit Log ---
    await recordAuditLog({
      userId,
      action: "TRANSACTION.BULK_UPDATE",
      status: "SUCCESS",
      details: { 
        count: updated.count,
        categoryId,
        transactionIds: transactionIds.slice(0, 5) // Log first 5 IDs for context
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

export async function DELETE(request: Request) {
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

    const { transactionIds, deleteAll } = await request.json();

    let deleted;
    if (deleteAll) {
      deleted = await prisma.transaction.deleteMany({
        where: { businessId: business.id }
      });
    } else {
      if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
        return NextResponse.json({ error: "No transactions selected for deletion." }, { status: 400 });
      }
      deleted = await prisma.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          businessId: business.id
        }
      });
    }

    // --- Audit Log ---
    await recordAuditLog({
      userId,
      action: deleteAll ? "TRANSACTION.CLEAR_ALL" : "TRANSACTION.BULK_DELETE",
      status: "SUCCESS",
      details: { 
        count: deleted.count,
        transactionIds: deleteAll ? "ALL" : transactionIds.slice(0, 5)
      }
    });

    return NextResponse.json({ 
      message: deleteAll ? "All transactions cleared successfully!" : `Successfully deleted ${deleted.count} transactions!`,
      count: deleted.count
    }, { status: 200 });

  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}