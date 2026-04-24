import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const business = await prisma.business.findUnique({
      where: { userId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastReadNotificationsAt: true }
    });

    // 1. Fetch Audit Logs (Activity Feed)
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch Compliance Issues (Action Items)
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        businessId: business.id,
        OR: [
          { categoryId: null },
          { vatStatus: 'MISSING_VAT' },
          { document: null }
        ]
      },
      take: 10,
      orderBy: { date: 'desc' },
      include: { document: true }
    });

    // 3. Format Unified Notifications
    const formattedNotifications = [
      ...logs.map((log: any) => ({
        id: `log-${log.id}`,
        type: 'activity',
        title: formatAction(log.action),
        message: formatDetails(log),
        time: log.createdAt,
        status: log.status,
      })),
      ...pendingTransactions.map((t: any) => ({
        id: `pending-${t.id}`,
        type: 'action',
        title: 'Action Required',
        message: getPendingMessage(t),
        time: t.updatedAt,
        status: 'WARNING',
        metadata: { transactionId: t.id }
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // 4. Calculate Unread Count
    const lastRead = user?.lastReadNotificationsAt || new Date(0);
    const unreadCount = formattedNotifications.filter(n => new Date(n.time) > lastRead).length;

    return NextResponse.json({ 
      notifications: formattedNotifications.slice(0, 20),
      unreadCount 
    });

  } catch (error) {
    console.error("Notifications Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function formatAction(action: string) {
  const map: Record<string, string> = {
    "AUTH.LOGIN_SUCCESS": "Sign In Successful",
    "AUTH.LOGIN_FAILURE": "Sign In Failed",
    "AUTH.PORTAL_MISMATCH": "Security Alert",
    "AUTH.SIGNUP": "Welcome to Siro",
    "TRANSACTION.CREATE": "New Transaction",
    "TRANSACTION.BULK_UPDATE": "Bulk Categorization",
    "TRANSACTION.VAT_UPDATE": "VAT Status Update",
    "DOCUMENT.UPLOAD": "Document Attached",
    "PROFILE.UPDATE": "Profile Updated"
  };
  return map[action] || action.replace(/[._]/g, ' ');
}

function formatDetails(log: any) {
  const d = log.details || {};
  const map: Record<string, string> = {
    "AUTH.LOGIN_SUCCESS": "You have successfully signed in to your dashboard.",
    "AUTH.LOGIN_FAILURE": "A failed login attempt was recorded for your account.",
    "AUTH.PORTAL_MISMATCH": "A security mismatch was detected during a login attempt.",
    "AUTH.SIGNUP": "Your account has been successfully created. Welcome!",
    "TRANSACTION.CREATE": `A new manual transaction of ₦${Number(d.amount).toLocaleString()} was recorded.`,
    "TRANSACTION.BULK_UPDATE": `${d.count} transactions were successfully categorized.`,
    "TRANSACTION.VAT_UPDATE": `VAT classification was updated for a transaction.`,
    "DOCUMENT.UPLOAD": `A new document "${d.fileName}" was attached to a transaction.`,
    "PROFILE.UPDATE": `You have successfully updated your business profile information.`,
  };

  return map[log.action] || `Action ${log.action.toLowerCase().replace(/[._]/g, ' ')} was completed successfully.`;
}

function getPendingMessage(t: any) {
  if (!t.categoryId) return `Categorization needed for ₦${t.amount}`;
  if (t.vatStatus === 'MISSING_VAT') return `VAT classification missing for ₦${t.amount}`;
  if (!t.document) return `Documentation missing for ${t.description}`;
  return "Transaction needs review";
}
