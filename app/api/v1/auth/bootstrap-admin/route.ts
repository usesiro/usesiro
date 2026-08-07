import { NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "../_lib/rate-limit";
import type { Prisma } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const bootstrapSchema = z.object({
  bootstrapSecret: z.string().min(1),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
}).strict();

function secretsMatch(provided: string, configured: string) {
  const providedBytes = Buffer.from(provided);
  const configuredBytes = Buffer.from(configured);
  return providedBytes.length === configuredBytes.length &&
    crypto.timingSafeEqual(providedBytes, configuredBytes);
}

export async function POST(request: Request) {
  try {
    const limit = checkRateLimit(
      `bootstrap-admin:${getClientIp(request)}`,
      5,
      15 * 60 * 1000,
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many setup attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const validation = bootstrapSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid administrator setup details." }, { status: 400 });
    }

    const configuredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!configuredSecret || configuredSecret.length < 24) {
      return NextResponse.json({ error: "Administrator setup is not configured." }, { status: 503 });
    }

    const { bootstrapSecret, firstName, lastName, email, password } = validation.data;
    if (!secretsMatch(bootstrapSecret, configuredSecret)) {
      return NextResponse.json({ error: "Invalid setup credentials." }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newAdmin = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Serialize bootstrap attempts across every app instance.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(734762901)`;

      const existingAdmin = await tx.user.findFirst({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });
      if (existingAdmin) throw new Error("BOOTSTRAP_COMPLETE");

      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) throw new Error("EMAIL_EXISTS");

      return tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          otpSecret: otpCode,
          otpExpiresAt,
          role: "SUPER_ADMIN",
        },
      });
    });

    await resend.emails.send({
      from: "Siro <no-reply@usesiro.com>",
      to: email,
      subject: "Verify your Siro administrator account",
      html: `<p>Your administrator verification code is:</p><h1>${otpCode}</h1><p>This code expires in 5 minutes.</p>`,
    });

    await recordAuditLog({
      userId: newAdmin.id,
      action: "AUTH.ADMIN_BOOTSTRAP",
      status: "SUCCESS",
      details: { email: newAdmin.email },
    });

    return NextResponse.json({ message: "Administrator created. Verification required." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "BOOTSTRAP_COMPLETE") {
      return NextResponse.json({ error: "Administrator setup has already been completed." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }
    console.error("Admin Bootstrap Error:", error);
    return NextResponse.json({ error: "Administrator setup failed." }, { status: 500 });
  }
}
