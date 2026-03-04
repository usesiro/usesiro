import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const { code } = await request.json();

    // Exchange with Mono V2
    const monoResponse = await fetch("https://api.withmono.com/v2/accounts/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY as string,
      },
      body: JSON.stringify({ code }),
    });

    const monoData = await monoResponse.json();
    console.log("MONO EXCHANGE RAW RESPONSE:", monoData); // <-- This will tell us exactly what Mono sent

    if (!monoResponse.ok) {
      return NextResponse.json({ error: "Mono Exchange Failed", details: monoData }, { status: 400 });
    }

    // Safely extract the ID (Mono sometimes wraps it differently in V2)
    const monoAccountId = monoData.id || monoData.data?.id;

    if (!monoAccountId) {
      console.error("No ID found in Mono response!");
      return NextResponse.json({ error: "Invalid Mono Response" }, { status: 500 });
    }

    // Save to the Database
    await prisma.business.update({
      where: { userId },
      data: { monoAccountId },
    });

    return NextResponse.json({ message: "Bank connected successfully!", accountId: monoAccountId });

  } catch (error) {
    console.error("Mono Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}