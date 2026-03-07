import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { autoCategorize } from "@/lib/categorizer";

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

    // --- NEW: Parse URL parameters for filtering ---
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");
    const source = searchParams.get("source");

    // Build the dynamic where clause
    const whereClause: any = { businessId: business.id };

    if (search) {
      whereClause.description = { contains: search, mode: "insensitive" };
    }
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) {
        // Set to the very end of the selected day to ensure we catch everything
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        whereClause.date.lte = end;
      }
    }

    if (type && type !== "All Types") {
      // Assuming frontend sends "Income" or "Expense", map it to Enum
      whereClause.type = type.toUpperCase(); 
    }

    if (source && source !== "All Sources") {
      whereClause.source = source.toUpperCase();
    }

    // Fetch the filtered transactions
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        category: true,
        document: true,
      }
    });

    // Stats will now dynamically reflect the current filter
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

    // 1. Fetch all available categories from the database
    const allCategories = await prisma.category.findMany();
    
    // 2. Pass the description through the categorizer
    const matchedCategoryId = autoCategorize(description, type as any, allCategories);

    // Create the transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        businessId: business.id,
        amount: parseFloat(amount),
        description,
        type, // "INCOME" or "EXPENSE"
        date: new Date(date),
        source: "MANUAL",
        categoryId: matchedCategoryId, // Injects the matched category ID
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