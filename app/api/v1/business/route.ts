import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { jwtVerify } from "jose";

// 1. Zod Schema: Validate the business details
const businessSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  type: z.enum(["SOLE_PROPRIETORSHIP", "PARTNERSHIP", "LIMITED_LIABILITY"]),
  industry: z.string().min(2, "Industry is required"),
  tin: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // 2. Extract the User ID from the token that the middleware already approved
    const authHeader = request.headers.get("authorization");
    const token = authHeader!.split(" ")[1];
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    // Decode the token to get the user ID
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 3. Parse and validate the incoming body
    const body = await request.json();
    const validation = businessSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, type, industry, tin } = validation.data;

    // 4. Check if this user already has a business set up
    const existingBusiness = await prisma.business.findUnique({
      where: { userId },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "User already has a business profile" },
        { status: 400 }
      );
    }

    // 5. Create the new Business record and link it to the User
    const newBusiness = await prisma.business.create({
      data: {
        userId,
        name,
        type,
        industry,
        tin,
      },
    });

    return NextResponse.json(
      { message: "Business profile created successfully!", business: newBusiness },
      { status: 201 }
    );

  } catch (error) {
    console.error("Business Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}