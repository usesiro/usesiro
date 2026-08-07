import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { recordAuditLog } from "@/lib/logger";
import { readLimitedJsonBody } from "@/lib/public-form-utils";
import { z } from "zod";

const transactionIdsSchema = z.array(z.string().uuid()).min(1).max(2_000);
const updateSchema = z.object({ transactionIds: transactionIdsSchema, categoryId: z.string().uuid() }).strict();
const deleteSchema = z.object({ transactionIds: transactionIdsSchema.optional(), deleteAll: z.boolean().optional() }).strict()
  .refine((value) => Boolean(value.deleteAll) || Boolean(value.transactionIds?.length), "Select transactions to delete.");

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

    const body = await readLimitedJsonBody(request, 256 * 1024);
    if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });
    const validation = updateSchema.safeParse(body.data);
    if (!validation.success) return NextResponse.json({ error: "Invalid bulk update details" }, { status: 400 });
    const { transactionIds, categoryId } = validation.data;

    // Update all selected transactions in one efficient database query
    const updated = await prisma.transaction.updateMany({
      where: {
        id: { in: transactionIds },
        businessId: business.id
      },
      data: {
        categoryId: categoryId,
        reviewStatus: "HUMAN_RESOLVED"
      }
    });

    // --- LEARNING: Save description→category patterns for future auto-categorization ---
    const resolvedTransactions = await prisma.transaction.findMany({
      where: { id: { in: transactionIds }, businessId: business.id },
      select: { description: true }
    });

    for (const tx of resolvedTransactions) {
      const pattern = tx.description.toLowerCase().trim().substring(0, 100);
      if (pattern.length > 0) {
        await prisma.businessCategoryRule.upsert({
          where: { businessId_pattern: { businessId: business.id, pattern } },
          update: { categoryId },
          create: { businessId: business.id, pattern, categoryId }
        }).catch(() => {}); // Ignore duplicate errors silently
      }
    }

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

    const body = await readLimitedJsonBody(request, 256 * 1024);
    if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });
    const validation = deleteSchema.safeParse(body.data);
    if (!validation.success) return NextResponse.json({ error: "Invalid bulk delete details" }, { status: 400 });
    const { transactionIds, deleteAll } = validation.data;

    let deleted;
    if (deleteAll) {
      deleted = await prisma.transaction.deleteMany({
        where: { businessId: business.id }
      });
    } else {
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
        transactionIds: deleteAll ? "ALL" : (transactionIds ?? []).slice(0, 5)
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
