import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import AdminSetupClient from "./AdminSetupClient";

export default async function AdminSetupPage() {
  // --- TEST-MODE LOCKDOWN: Looking for SUPER_ADMIN presence ---
  // Temporarily relaxed from User.count() === 0 to allow testing with 6 existing users.
  const adminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' as any } });
  if (adminCount > 0) {
    redirect("/pigshit/auth?error=setup_completed");
  }

  return <AdminSetupClient />;
}
