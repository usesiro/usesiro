import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const business = await prisma.business.findUnique({
      where: { userId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Fetch all logs for this user
    // We filter by userId
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({
        where: { userId }
      })
    ]);

    return NextResponse.json({ 
      logs: logs.map((log: any) => ({
        id: log.id,
        action: log.action,
        status: log.status,
        details: log.details,
        ip: log.ip,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Audit Logs Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
