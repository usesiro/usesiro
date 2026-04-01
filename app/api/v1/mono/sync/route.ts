import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { autoCategorize } from "@/lib/categorizer";

export async function POST(request: Request) {
  try {
    // 1. Verify User
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 2. Get the saved Mono Account ID
    const business = await prisma.business.findUnique({
      where: { userId },
    });

    if (!business || !business.monoAccountId) {
      return NextResponse.json({ error: "No bank account linked" }, { status: 400 });
    }

    // 3. Fetch Transactions from Mono
    const monoResponse = await fetch(`https://api.withmono.com/v2/accounts/${business.monoAccountId}/transactions`, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY as string,
      },
    });

    const monoData = await monoResponse.json();

    if (!monoResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch transactions", details: monoData }, { status: 400 });
    }

    // 4. Fetch all available categories from the database ONCE before the loop
    const allCategories = await prisma.category.findMany();

    // 5. Save to Database (Bulk Insert Optimization)
    const transactions = monoData.data || [];
    if (transactions.length === 0) {
      return NextResponse.json({ message: "No new transactions found to sync!" });
    }

    // A. Gather all external IDs to check
    const incomingIds = transactions
      .map((txn: any) => txn._id || txn.id)
      .filter(Boolean);

    // B. Hit the DB ONCE to find all existing records
    const existingRecords = await prisma.transaction.findMany({
      where: { externalId: { in: incomingIds } },
      select: { externalId: true },
    });
    const existingIdsSet = new Set(existingRecords.map(r => r.externalId));

    // C. Prepare the bulk array in memory (No DB hits here!)
    const bulkData: any[] = [];
    for (const txn of transactions) {
      const extId = txn._id || txn.id;
      
      // Skip if it already exists in the database
      if (!extId || existingIdsSet.has(extId)) continue;

      const transactionType = txn.type === "credit" ? "INCOME" : "EXPENSE";
      const description = txn.narration || "Bank Transaction";
      const matchedCategoryId = autoCategorize(description, transactionType, allCategories);

      bulkData.push({
        businessId: business.id,
        amount: txn.amount / 100, // Mono returns Kobo, divide by 100 for Naira
        date: new Date(txn.date || txn.created_at),
        description: description,
        source: "MONO",
        type: transactionType,
        categoryId: matchedCategoryId,
        vatStatus: "MISSING_VAT",
        externalId: extId,
      });
    }

    // D. Hit the DB ONCE to insert everything
    let savedCount = 0;
    if (bulkData.length > 0) {
      const result = await prisma.transaction.createMany({
        data: bulkData,
        skipDuplicates: true, // Double safety net
      });
      savedCount = result.count;
    }

    return NextResponse.json({ message: `Successfully synced ${savedCount} new transactions!` });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}