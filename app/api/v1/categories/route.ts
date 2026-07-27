import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

/**
 * GET: Returns standard categories + custom categories for the authenticated business.
 * POST: Creates a custom category for the authenticated business.
 */
export async function GET(request: Request) {
  try {
    // Try to get business-specific categories if authenticated
    let businessId: string | null = null;
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId as string;
        const business = await prisma.business.findUnique({ where: { userId } });
        if (business) businessId = business.id;
      } catch { /* unauthenticated — just return standard categories */ }
    }

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isStandard: true },
          ...(businessId ? [{ businessId }] : []),
        ]
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const { name } = await request.json();
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Category name must be at least 2 characters" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Check if this business already has a custom category with the same slug
    const existing = await prisma.category.findFirst({
      where: { slug, businessId: business.id }
    });
    if (existing) {
      return NextResponse.json({ error: "You already have a category with this name" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        isStandard: false,
        businessId: business.id,
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
