import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return NextResponse.json({ error: "Unauthorized - No Token" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // Fetch business AND include the user so the Settings form can populate!
    const business = await prisma.business.findUnique({
      where: { userId },
      include: {
        user: true, // MUST include this to get firstName, lastName, phone
        _count: {
          select: { transactions: true }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Map the user to 'owner' so your frontend Settings page automatically reads it
    const responseData = {
      ...business,
      owner: business.user 
    };

    return NextResponse.json(responseData);

  } catch (error) {
    // Log the actual error to the terminal so we don't have to guess
    console.error("GET Business Error:", error); 
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return NextResponse.json({ error: "Unauthorized - No Token" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // Parse the incoming update data
    const body = await request.json();

    // 1. Handle Business Info Updates
    if (body.name || body.industry) {
      await prisma.business.update({
        where: { userId },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.industry && { industry: body.industry }),
        }
      });
    }

    // 2. Handle Personal Info Updates
    if (body.owner) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(body.owner.firstName && { firstName: body.owner.firstName }),
          ...(body.owner.lastName && { lastName: body.owner.lastName }),
          ...(body.owner.phone && { phone: body.owner.phone }),
        }
      });
    }

    // Send a success response back to the frontend
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("PATCH Settings update error:", error);
    return NextResponse.json({ error: "Failed to update details" }, { status: 500 });
  }
}