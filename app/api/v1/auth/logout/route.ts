import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("siro_auth_token")?.value;

    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (typeof payload.userId === "string") {
          await prisma.user.updateMany({
            where: { id: payload.userId },
            data: { sessionVersion: { increment: 1 } },
          });
        }
      } catch {
        // Clearing an already invalid session should still succeed.
      }
    }

    cookieStore.delete("siro_auth_token");
    
    return NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
