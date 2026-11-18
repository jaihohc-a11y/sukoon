import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAdminUserCount,
  createAdminUser,
  checkIsAdminServer,
  generateSessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/admin-auth";

export async function GET() {
  try {
    const count = await getAdminUserCount();
    return NextResponse.json({
      hasUsers: count > 0,
      count,
    });
  } catch (error) {
    console.error("Setup check error:", error);
    return NextResponse.json(
      { hasUsers: false, error: "Failed to check setup status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const count = await getAdminUserCount();
    const isInitialSetup = count === 0;

    // If users already exist, only an authenticated admin can create another user
    if (!isInitialSetup) {
      const isAdmin = await checkIsAdminServer();
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized: Administrator access required to create additional users." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const result = await createAdminUser({
      email,
      password,
      name: name || "Sukoon Administrator",
      role: "admin",
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Failed to create user." },
        { status: 400 }
      );
    }

    // If initial setup, log them in immediately
    if (isInitialSetup) {
      const token = generateSessionToken(result.user.email);
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({
      success: true,
      message: isInitialSetup
        ? "Admin account created and logged in successfully."
        : "User created successfully.",
      user: result.user,
    });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
