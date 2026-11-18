import { NextResponse } from "next/server";
import { getAllBlogs, createBlog, getBlogCategories } from "@/lib/blog-service";
import { checkIsAdminServer } from "@/lib/admin-auth";
import { BlogFormData } from "@/types/blog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedStatus = searchParams.get("status");
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;

    const isAdmin = await checkIsAdminServer();

    // If client asks for all or draft blogs, verify admin privileges
    let status: "all" | "published" | "draft" = "published";
    if (requestedStatus === "all" || requestedStatus === "draft") {
      if (isAdmin) {
        status = requestedStatus;
      } else {
        status = "published";
      }
    } else if (requestedStatus === "published") {
      status = "published";
    }

    const blogs = await getAllBlogs({ status, category, search, limit });
    const categories = await getBlogCategories();

    return NextResponse.json({
      blogs,
      categories,
      total: blogs.length,
    });
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const body: BlogFormData = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Blog title is required" },
        { status: 400 }
      );
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: "Blog content is required" },
        { status: 400 }
      );
    }

    const created = await createBlog(body);
    return NextResponse.json(
      { success: true, blog: created, message: "Blog post created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
