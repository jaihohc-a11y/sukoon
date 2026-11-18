import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { checkIsAdminServer } from "@/lib/admin-auth";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Allowed image MIME types
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required to upload images." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file was provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type (${file.type}). Please upload a JPEG, PNG, WebP, GIF, or SVG image.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file exceeds maximum allowed size of 10MB." },
        { status: 400 }
      );
    }

    // Determine safe file extension & filename
    const originalExt = path.extname(file.name).toLowerCase();
    const safeExt = originalExt || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");
    const sanitizedBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30);
    const uniqueName = `sukoon-${sanitizedBase || "image"}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${safeExt}`;

    // 1. If Vercel Blob token is configured (Production on Vercel)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(uniqueName, file, {
        access: "public",
        contentType: file.type,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        filename: blob.pathname,
        size: file.size,
        mimeType: file.type,
        storage: "vercel-blob",
        message: "Image uploaded successfully to Vercel Blob CDN",
      });
    }

    // 2. Local fallback for local development without Vercel Blob token
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const filePath = path.join(UPLOADS_DIR, uniqueName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      size: file.size,
      mimeType: file.type,
      storage: "local",
      message: "Image uploaded successfully to local storage",
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to process image upload." },
      { status: 500 }
    );
  }
}
