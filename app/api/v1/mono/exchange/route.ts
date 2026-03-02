import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
  try {
    // 1. Auth Guard (Verify the user is logged in)
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 2. Get the temporary code from the frontend
    const { code } = await request.json();

    // 3. Exchange code for Account ID via Mono API
    const monoResponse = await fetch("https://api.withmono.com/account/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
      },
      body: JSON.stringify({ code }),
    });

    const monoData = await monoResponse.json();

    if (!monoResponse.ok) {
      return NextResponse.json({ error: "Mono Exchange Failed", details: monoData }, { status: 400 });
    }

    const monoAccountId = monoData.id;

    // 4. Save the Mono Account ID to the Business record in our DB
    // [Inference] based on schema: Business is linked to User 1:1
    await prisma.business.update({
      where: { userId },
      data: { monoAccountId }, // We need to add this field to Prisma next
    });

    return NextResponse.json({ message: "Bank connected successfully!", accountId: monoAccountId });

  } catch (error) {
    console.error("Mono Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}