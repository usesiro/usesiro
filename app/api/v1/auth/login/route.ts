import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate Payload
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 2. Find user
    const user = await prisma.user.findUnique({ 
        where: { email },
        include: { business: true } // Include business info for the frontend
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Check Verification
    if (!user.isVerified) {
      return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
    }

    // 4. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 5. Generate the JWT (Edge Compatible)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    const accessToken = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // Extended for the meeting demo
      .sign(secret);

    // 6. Create the Response
    const response = NextResponse.json(
      { 
        message: "Login successful", 
        accessToken,
        user: {
            id: user.id,
            email: user.email,
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

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}