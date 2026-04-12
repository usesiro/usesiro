import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { generateHeaderHash, generateTransactionIdempotencyKey } from "@/lib/import-utils";
import { parseFlexibleDate, parseFlexibleAmount } from "@/lib/import-parsers";
import { autoCategorize } from "@/lib/categorizer";
import { recordAuditLog } from "@/lib/logger";

/**
 * Handles the actual import of mapped or standardized transactions.
 * Prevents duplicates via unique 'externalId' fingerprints.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Session expired" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const business = await prisma.business.findUnique({
      where: { userId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data, mapping, headers, rate, updateOpeningBalance } = await request.json();
    if (!data || !headers) {
      return NextResponse.json({ error: "Missing required import data" }, { status: 400 });
    }

    // --- STEP 1: Persist the Mapping (Only if manual mapping occurred) ---
    if (mapping && Object.keys(mapping).length > 0) {
      const headerHash = generateHeaderHash(headers);
      await prisma.savedMapping.upsert({
        where: { businessId_headerHash: { businessId: business.id, headerHash } },
        update: { mapping },
        create: { businessId: business.id, headerHash, mapping }
      });
    }

    // --- STEP 2: Process Transactions ---
    const allCategories = await prisma.category.findMany();
    const transactionsToCreate: any[] = [];
    
    console.log(`[Import] Processing ${data.length} items. Applying rate: ${rate || 1}`);

    const getMappedValue = (row: any, field: string) => {
      if (!mapping) return row[field]; // If standardized, field IS the key
      const entry = Object.entries(mapping).find(([_, mappedField]) => mappedField === field);
      return entry ? row[entry[0]] : row[field];
    };

    for (const row of data) {
      let finalAmount = 0;
      let finalType: "INCOME" | "EXPENSE" = "INCOME";
      let txDate: Date | null = null;
      let desc = "Imported transaction";

      // Case A: Standardized data from AI (has direct keys)
      if (row.date && row.amount !== undefined && row.type) {
        txDate = parseFlexibleDate(row.date);
        finalAmount = parseFlexibleAmount(row.amount);
        finalType = row.type as "INCOME" | "EXPENSE";
        desc = row.description || desc;
      } 
      // Case B: Raw data with manual mapping
      else {
        const amountVal = getMappedValue(row, 'amount');
        const debitVal = getMappedValue(row, 'debit');
        const creditVal = getMappedValue(row, 'credit');
        const dateVal = getMappedValue(row, 'date');
        const descVal = getMappedValue(row, 'description');
        const typeIndicatorVal = getMappedValue(row, 'transaction_type');

        desc = descVal || "Imported transaction";

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
        }
        
        txDate = parseFlexibleDate(dateVal);
      }

      if (!txDate || (finalAmount === 0)) {
        continue;
      }

      // Apply currency conversion if non-NGN rate is provided
      if (rate && rate > 0) {
        finalAmount = finalAmount * rate;
      }

      const externalId = generateTransactionIdempotencyKey(
        finalAmount,
        txDate,
        desc,
        business.id,
        row.reference,
        row.balance
      );

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

    // --- STEP 3: Batch Create ---
    const result = await prisma.transaction.createMany({
      data: transactionsToCreate,
      skipDuplicates: true
    });

    const duplicateCount = transactionsToCreate.length - result.count;

    // --- STEP 4: Handle Opening Balance Update (If requested) ---
    if (updateOpeningBalance) {
      // In a real app, you'd save this to a 'startingBalance' field in the Business or Account model.
      // For now, we record it in the audit log as an official record of the user's intent.
      await recordAuditLog({
        userId,
        action: "BUSINESS.SET_STARTING_BALANCE",
        status: "SUCCESS",
        details: { amount: updateOpeningBalance, businessId: business.id }
      });
    }

    await recordAuditLog({
      userId,
      action: "TRANSACTION.IMPORT",
      status: "SUCCESS",
      details: { 
        count: result.count, 
        duplicates: duplicateCount, 
        rateApplied: rate || 1,
        hadOpeningBalance: !!updateOpeningBalance
      }
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      duplicates: duplicateCount,
      message: `Successfully imported ${result.count} transactions.`
    });

  } catch (error) {
    console.error("Execute Import Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
