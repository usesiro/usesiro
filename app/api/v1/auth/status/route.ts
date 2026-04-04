import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' as any } });
    return NextResponse.json({ userCount, adminCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ userCount: 0, adminCount: 0 }, { status: 500 });
  }
}
