import { NextResponse } from "next/server";
import {
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "@/lib/blog-service";
import { checkIsAdminServer } from "@/lib/admin-auth";
import { BlogFormData } from "@/types/blog";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Try finding by id first, then by slug
    let blog = await getBlogById(id);
    if (!blog) {
      blog = await getBlogBySlug(id);
    }

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // If draft, only admin can view
    if (blog.status === "draft") {
      const isAdmin = await checkIsAdminServer();
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Blog is not published" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("GET /api/blogs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body: Partial<BlogFormData> = await request.json();

    const updated = await updateBlog(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      blog: updated,
      message: "Blog post updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/blogs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const deleted = await deleteBlog(id);

    if (!deleted) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/blogs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
