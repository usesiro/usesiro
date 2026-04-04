import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const admins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' as any },
      select: { email: true }
    });
    
    return NextResponse.json({ 
      userCount, 
      adminCount: admins.length,
      admins: admins.map(a => a.email)
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ userCount: 0, adminCount: 0, admins: [] }, { status: 500 });
  }
}
