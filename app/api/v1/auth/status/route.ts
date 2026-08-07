import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });
    return NextResponse.json({ initialized: Boolean(admin) }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ initialized: true }, { status: 500 });
  }
}
