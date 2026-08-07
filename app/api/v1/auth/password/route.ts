import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/logger";
import { checkRateLimit } from "../_lib/rate-limit";

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12, "New password must be at least 12 characters").max(128),
}).strict();

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = checkRateLimit(`change-password:${payload.userId}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many password attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const validation = passwordSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid password details" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = validation.data;
    const currentMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentMatches) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      return NextResponse.json({ error: "New password must be different" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });

    await recordAuditLog({
      userId: user.id,
      action: "AUTH.PASSWORD_CHANGE",
      status: "SUCCESS",
    });

    const response = NextResponse.json({ message: "Password updated. Please sign in again." });
    response.cookies.delete("siro_auth_token");
    return response;
  } catch (error) {
    console.error("Password Change Error:", error);
    return NextResponse.json({ error: "Unable to update password" }, { status: 500 });
  }
}
