import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { generateHeaderHash, generateTransactionIdempotencyKey } from "@/lib/import-utils";
import { parseFlexibleDate, parseFlexibleAmount } from "@/lib/import-parsers";
import { autoCategorize } from "@/lib/categorizer";
import { recordAuditLog } from "@/lib/logger";

/**
 * Handles the actual import of mapped transactions.
 * Prevents duplicates via unique 'externalId' fingerprints.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Your session has expired. Please sign in again to continue." }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const business = await prisma.business.findUnique({
      where: { userId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data, mapping, headers } = await request.json();
    if (!data || !mapping || !headers) {
      return NextResponse.json({ error: "Missing required import data" }, { status: 400 });
    }

    // --- STEP 1: Persist the Mapping for Future Use ---
    const headerHash = generateHeaderHash(headers);
    await prisma.savedMapping.upsert({
      where: { businessId_headerHash: { businessId: business.id, headerHash } },
      update: { mapping },
      create: { businessId: business.id, headerHash, mapping }
    });

    // --- STEP 2: Process Transactions ---
    const allCategories = await prisma.category.findMany();
    const transactionsToCreate: any[] = [];
    let duplicateCount = 0;

    console.log(`[Import] Processing ${data.length} rows with mapping:`, mapping);

    const getMappedValue = (row: any, field: string) => {
      const entry = Object.entries(mapping).find(([_, mappedField]) => mappedField === field);
      return entry ? row[entry[0]] : undefined;
    };

    for (const row of data) {
      // 1. Determine Amount and Type based on mapping logic
      let finalAmount = 0;
      let finalType: "INCOME" | "EXPENSE" = "INCOME";

      const amountVal = getMappedValue(row, 'amount');
      const debitVal = getMappedValue(row, 'debit');
      const creditVal = getMappedValue(row, 'credit');
      const dateVal = getMappedValue(row, 'date');
      const descVal = getMappedValue(row, 'description');
      const refVal = getMappedValue(row, 'reference');
      const balVal = getMappedValue(row, 'balance');
      const typeIndicatorVal = getMappedValue(row, 'transaction_type');

      const desc = descVal || "Imported transaction";
      const valStr = amountVal || debitVal || creditVal || "";

      if (amountVal !== undefined && amountVal !== "") {
        const val = parseFlexibleAmount(amountVal);
        finalType = val < 0 ? "EXPENSE" : "INCOME";
        
        if (typeIndicatorVal && typeof typeIndicatorVal === 'string') {
          const tLower = typeIndicatorVal.toLowerCase();
          if (tLower.includes('out') || tLower.includes('expense') || tLower.includes('dr') || tLower.includes('debit') || tLower.includes('withdrawal')) {
            finalType = 'EXPENSE';
          } else if (tLower.includes('in') || tLower.includes('income') || tLower.includes('cr') || tLower.includes('credit') || tLower.includes('deposit')) {
            finalType = 'INCOME';
          }
        }

        finalAmount = Math.abs(val);
      } else if (debitVal !== undefined && debitVal !== "") {
        finalAmount = Math.abs(parseFlexibleAmount(debitVal));
        finalType = "EXPENSE";
      } else if (creditVal !== undefined && creditVal !== "") {
        finalAmount = Math.abs(parseFlexibleAmount(creditVal));
        finalType = "INCOME";
      } else {
        console.warn(`[Import] Row skipped: No amount detected in columns. Row data:`, row);
        continue;
      }

      if (finalAmount === 0 && valStr === "") {
        console.warn(`[Import] Row skipped: Amount is 0 or empty.`, row);
        continue;
      }

      const txDate = parseFlexibleDate(dateVal);
      if (!txDate) {
        console.warn(`[Import] Row skipped: Invalid date '${dateVal}'.`, row);
        continue;
      }

      // 2. Generate Idempotency Key (Signature)
      const externalId = generateTransactionIdempotencyKey(
        finalAmount,
        txDate,
        desc,
        business.id,
        refVal,
        balVal
      );

      // 3. Categorize automatically
      const categoryId = autoCategorize(desc, finalType, allCategories);

      transactionsToCreate.push({
        businessId: business.id,
        amount: finalAmount,
        date: txDate,
        description: desc,
        source: "FILE_UPLOAD",
        type: finalType,
        categoryId,
        externalId,
        vatStatus: "MISSING_VAT"
      });
    }

    console.log(`[Import] ${transactionsToCreate.length} transactions prepared for batch create.`);

    // --- STEP 3: Batch Create (Ignoring Duplicates) ---
    // We use 'createMany' with 'skipDuplicates' to ensure idempotency.
    // Note: externalId must have a UNIQUE constraint in the DB for this to work correctly.
    // Our Prisma schema already has @unique on externalId.
    const result = await prisma.transaction.createMany({
      data: transactionsToCreate,
      skipDuplicates: true
    });

    duplicateCount = transactionsToCreate.length - result.count;

    // --- STEP 4: Record Audit Log ---
    await recordAuditLog({
      userId,
      action: "TRANSACTION.IMPORT",
      status: "SUCCESS",
      details: { 
        count: result.count, 
        duplicates: duplicateCount, 
        fileType: "CSV/EXCEL" 
      }
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      duplicates: duplicateCount,
      message: `Successfully imported ${result.count} transactions. ${duplicateCount} duplicates were skipped.`
    });

  } catch (error) {
    console.error("Execute Import Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
