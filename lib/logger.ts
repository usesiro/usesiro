import { prisma } from "./prisma";
import { headers } from "next/headers";

/**
 * Compliance-grade Audit Logger
 * Automatically captures IP and User Agent when called within a request context.
 */
export async function recordAuditLog({
  userId,
  action,
  status,
  details = {},
}: {
  userId?: string;
  action: string;
  status: "SUCCESS" | "FAILURE" | "WARNING";
  details?: any;
}) {
  let ip = "unknown";
  let userAgent = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "unknown";
    userAgent = headersList.get("user-agent") || "unknown";
  } catch (e) {
    // Headers not available (outside request context)
  }

  try {
    return await (prisma as any).auditLog.create({
      data: {
        userId,
        action,
        status,
        details,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("CRITICAL: Failed to write AuditLog:", error);
    // Don't throw error to avoid breaking the main request flow, but log to console
  }
}
