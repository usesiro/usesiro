import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

// --- GET: Fetch all transactions ---
export async function GET(request: Request) {
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

    const transactions = await prisma.transaction.findMany({
      where: { businessId: business.id },
      orderBy: { date: 'desc' },
      include: {
        category: true,
        document: true,
      }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBalance = totalIncome - totalExpense;

    return NextResponse.json({
      transactions,
      stats: { totalIncome, totalExpense, netBalance }
    });

  } catch (error) {
    console.error("Fetch Transactions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- POST: Add a new manual transaction ---
export async function POST(request: Request) {
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
    const { amount, description, type, date } = body;

    // Basic Validation
    if (!amount || !description || !type || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        businessId: business.id,
        amount: parseFloat(amount),
        description,
        type, // "INCOME" or "EXPENSE"
        date: new Date(date),
        source: "MANUAL",
        vatStatus: "MISSING_VAT", // Defaulting to missing so it flags in Tax Readiness
      }
    });

    return NextResponse.json(
      { message: "Transaction added successfully!", transaction: newTransaction },
      { status: 201 }
    );

  } catch (error) {
    console.error("Add Transaction Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}