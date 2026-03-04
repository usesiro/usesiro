import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

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

    // 4. Save to Database
    const transactions = monoData.data || [];
    let savedCount = 0;

    for (const txn of transactions) {
      // Use externalId to prevent duplicate transactions if they click sync twice
      const existingTxn = await prisma.transaction.findUnique({
        where: { externalId: txn._id || txn.id },
      });

      if (!existingTxn) {
        await prisma.transaction.create({
          data: {
            businessId: business.id,
            amount: txn.amount / 100, // Mono returns Kobo, divide by 100 for Naira
            date: new Date(txn.date || txn.created_at),
            description: txn.narration || "Bank Transaction",
            source: "MONO",
            type: txn.type === "credit" ? "INCOME" : "EXPENSE",
            vatStatus: "MISSING_VAT",
            externalId: txn._id || txn.id,
          }
        });
        savedCount++;
      }
    }

    return NextResponse.json({ message: `Successfully synced ${savedCount} new transactions!` });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}