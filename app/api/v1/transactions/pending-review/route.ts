import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { recordAuditLog } from "@/lib/logger";

/**
 * GET: Fetch all transactions flagged as PENDING_REVIEW for the authenticated business.
 * PATCH: Resolve a pending transaction — assign category, save tenant-specific rule.
 */

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        businessId: business.id,
        reviewStatus: "PENDING_REVIEW"
      },
      include: { category: true },
      orderBy: { date: "desc" }
    });

    return NextResponse.json({ transactions: pendingTransactions });
  } catch (error) {
    console.error("Pending Review GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const { transactionId, categoryId } = await request.json();
    if (!transactionId || !categoryId) {
      return NextResponse.json({ error: "transactionId and categoryId are required" }, { status: 400 });
    }

    // 1. Verify the transaction belongs to this business
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, businessId: business.id }
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // 2. Update the transaction
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        categoryId,
        reviewStatus: "HUMAN_RESOLVED"
      }
    });

    // 3. Save tenant-specific pattern rule
    // Normalize: lowercase, trim, take first 100 chars
    const pattern = transaction.description.toLowerCase().trim().substring(0, 100);

    if (pattern.length > 0) {
      await prisma.businessCategoryRule.upsert({
        where: {
          businessId_pattern: {
            businessId: business.id,
            pattern
          }
        },
        update: { categoryId },
        create: {
          businessId: business.id,
          pattern,
          categoryId
        }
      });
    }

    // 4. Audit log
    await recordAuditLog({
      userId,
      action: "TRANSACTION.HUMAN_RESOLVE",
      status: "SUCCESS",
      details: {
        transactionId,
        categoryId,
        pattern,
        description: transaction.description
      }
    });

    return NextResponse.json({
      message: "Transaction resolved and pattern saved.",
      transaction: updated
    });
  } catch (error) {
    console.error("Pending Review PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
