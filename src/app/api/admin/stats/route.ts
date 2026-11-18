import { NextResponse } from "next/server";
import { getBlogStats } from "@/lib/blog-service";
import { checkIsAdminServer } from "@/lib/admin-auth";

export async function GET() {
  try {
    const isAdmin = await checkIsAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getBlogStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
