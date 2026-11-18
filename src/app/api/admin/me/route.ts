import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const isValid = verifySessionToken(token);

    if (!isValid || !token) {
      return NextResponse.json({ authenticated: false });
    }

    let email = "admin";
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const parts = decoded.split(":");
      if (parts[0]) email = parts[0];
    } catch {
      // fallback
    }

    return NextResponse.json({
      authenticated: true,
      email,
      role: "admin",
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to check session" },
      { status: 500 }
    );
  }
}
