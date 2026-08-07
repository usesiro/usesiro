import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";
import { recordAuditLog } from "@/lib/logger";
import { readLimitedJsonBody } from "@/lib/public-form-security";
import { checkRateLimit, getClientIp } from "../_lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required").max(128),
  portal: z.enum(["USER", "ADMIN"]).optional().default("USER"), // Added portal field
});

export async function POST(request: Request) {
  try {
    const ipLimit = await checkRateLimit(`login:ip:${getClientIp(request)}`, 20, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } },
      );
    }

    const body = await readLimitedJsonBody(request, 8 * 1024);
    if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });

    // 1. Validate Payload
    const validation = loginSchema.safeParse(body.data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, portal } = validation.data;
    const emailLimit = await checkRateLimit(`login:email:${email}`, 8, 15 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } },
      );
    }

    // 2. Find user
    const user = await prisma.user.findUnique({ 
        where: { email },
        include: { business: true } // Include business info for the frontend
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // --- IDENTITY ISOLATION CHECK (After Password Verification) ---
    // This prevents role leakage and user enumeration.
    // SUPER_ADMIN can access both portals (they are founders).
    const isAdmin = ["SUPER_ADMIN", "BUSINESS_ADMIN", "FINANCE_ADMIN"].includes(user.role);
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    if (!isSuperAdmin) {
      if ((portal === "ADMIN" && !isAdmin) || (portal === "USER" && isAdmin)) {
        await recordAuditLog({
          userId: user.id,
          action: "AUTH.PORTAL_MISMATCH",
          status: "FAILURE",
          details: { email: user.email, attemptedPortal: portal, userRole: user.role }
        });
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    // 4. Check Verification
    if (!user.isVerified) {
      return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
    }

    // 5. Generate the JWT (Edge Compatible)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    const accessToken = await new SignJWT({
      userId: user.id,
      role: user.role,
      sessionVersion: user.sessionVersion,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") 
      .sign(secret);

    // 6. Create the Response
    const response = NextResponse.json(
      { 
        message: "Login successful", 
        user: {
            id: user.id,
            email: user.email,
            role: user.role, // Added role for frontend logic
            businessName: user.business?.name
        }
      },
      { status: 200 }
    );

    // 7. SET THE SECURITY COOKIE (The "Badge")
    // This is what the Middleware looks for to allow access to /dashboard
    response.cookies.set("siro_auth_token", accessToken, {
      httpOnly: true, // Security: Prevents Cross-Site Scripting (XSS)
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in prod
      sameSite: "lax", // Protects against CSRF
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/", // Valid for the whole site
    });

    // 6. Record Audit Log (Compliance)
    await recordAuditLog({
      userId: user.id,
      action: "AUTH.LOGIN_SUCCESS",
      status: "SUCCESS",
      details: { email: user.email, role: user.role }
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    // Log failed attempt if it was a credential issue or other (user might be null here if not found)
    await recordAuditLog({
      action: "AUTH.LOGIN_FAILURE",
      status: "FAILURE",
      details: { error: "Internal Server Error or Authentication Failed" }
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
