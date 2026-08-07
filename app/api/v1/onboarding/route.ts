import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readLimitedJsonBody } from "@/lib/public-form-utils";

const STORED_STEPS = ["REPORT_GENERATED", "TOUR_COMPLETED"] as const;
const ALL_STEPS = [
  "PROFILE_COMPLETED",
  "TRANSACTION_ADDED",
  "TRANSACTION_CATEGORIZED",
  "VAT_REVIEWED",
  "DOCUMENT_ATTACHED",
  "REPORT_GENERATED",
] as const;

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("complete_step"), step: z.enum(STORED_STEPS) }).strict(),
  z.object({ action: z.literal("dismiss") }).strict(),
  z.object({ action: z.literal("resume") }).strict(),
]);

async function authenticatedUserId(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return typeof payload.userId === "string" ? payload.userId : null;
}

async function getProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      onboardingSteps: true,
      onboardingDismissedAt: true,
      onboardingCompletedAt: true,
      business: { select: { id: true, name: true, industry: true } },
    },
  });
  if (!user) return null;

  const businessId = user.business?.id;
  const [transactionCount, categorizedCount, vatReviewedCount, documentedCount] = businessId
    ? await Promise.all([
        prisma.transaction.count({ where: { businessId } }),
        prisma.transaction.count({ where: { businessId, reviewStatus: "HUMAN_RESOLVED" } }),
        prisma.transaction.count({ where: { businessId, vatStatus: { in: ["TAGGED", "EXEMPT"] } } }),
        prisma.transaction.count({ where: { businessId, document: { isNot: null } } }),
      ])
    : [0, 0, 0, 0];

  const completed = new Set(user.onboardingSteps);
  if (user.firstName && user.lastName && user.phone && user.business?.name && user.business.industry) {
    completed.add("PROFILE_COMPLETED");
  }
  if (transactionCount > 0) completed.add("TRANSACTION_ADDED");
  if (categorizedCount > 0) completed.add("TRANSACTION_CATEGORIZED");
  if (vatReviewedCount > 0) completed.add("VAT_REVIEWED");
  if (documentedCount > 0) completed.add("DOCUMENT_ATTACHED");

  const completedSteps = ALL_STEPS.filter((step) => completed.has(step));
  const isComplete = completedSteps.length === ALL_STEPS.length;

  if (isComplete !== Boolean(user.onboardingCompletedAt)) {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompletedAt: isComplete ? new Date() : null },
    });
  }

  return {
    completedSteps,
    totalSteps: ALL_STEPS.length,
    completedCount: completedSteps.length,
    isComplete,
    isDismissed: Boolean(user.onboardingDismissedAt),
  };
}

export async function GET(request: Request) {
  try {
    const userId = await authenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const progress = await getProgress(userId);
    if (!progress) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Onboarding GET Error:", error);
    return NextResponse.json({ error: "Unable to load onboarding progress" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await authenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await readLimitedJsonBody(request, 8 * 1024);
    if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });
    const validation = updateSchema.safeParse(body.data);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid onboarding update" }, { status: 400 });
    }

    if (validation.data.action === "complete_step") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { onboardingSteps: true },
      });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const onboardingSteps = Array.from(new Set([...user.onboardingSteps, validation.data.step]));
      await prisma.user.update({ where: { id: userId }, data: { onboardingSteps } });
    } else if (validation.data.action === "dismiss") {
      await prisma.user.update({ where: { id: userId }, data: { onboardingDismissedAt: new Date() } });
    } else {
      await prisma.user.update({ where: { id: userId }, data: { onboardingDismissedAt: null } });
    }

    const progress = await getProgress(userId);
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Onboarding PATCH Error:", error);
    return NextResponse.json({ error: "Unable to update onboarding progress" }, { status: 500 });
  }
}
