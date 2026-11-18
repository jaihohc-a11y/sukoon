import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { list } from "@vercel/blob";
import { checkIsAdminServer } from "@/lib/admin-auth";

export interface MediaFileItem {
  url: string;
  name: string;
  filename: string;
  folder: "images" | "uploads" | "logo" | "public";
  category: string;
  size: number;
  formattedSize: string;
  modifiedAt: number;
}

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
]);

const IGNORED_FILES = new Set([
  "next.svg",
  "vercel.svg",
  "file.svg",
  "window.svg",
  "globe.svg",
]);

const CUSTOM_TITLES: Record<string, string> = {
  "1": "Dining Ambience 1",
  "2": "Dining Ambience 2",
  "3": "Dining Ambience 3",
  "about-dish": "Artisan Plating & Spices",
  "about-image": "Restaurant Interior & Heritage",
  "about": "Sukoon Dining Room",
  "behind-sukoon": "Behind the Scenes Hearth",
  "exp-1": "Slow Simmering & Clay Pots",
  "exp-2": "Charcoal Tandoori Naan",
  "exp-3": "Aromatic Spice Blend",
  "exp-4": "Curated Wine Pairings",
  "exp-5": "Royal Awadhi Feast",
  "exp-6": "Live Charcoal Grilling",
  "feel-right": "Atmosphere & Lighting",
  "gallery": "Dining Gallery",
  "hero-image": "Swan Street Evening",
  "JOHN8815": "Royal Courtyard Banquet",
  "JOHN8819": "Handi Curry Presentation",
  "JOHN8821": "Feast with Fine Wine",
  "JOHN8836": "Slow Smoked Tandoor",
  "JOHN8870": "Candlelit Evening Service",
  "JOHN8875": "Artisanal Biryani Deg",
  "JOHN8893": "Chef Tasting Platter",
  "menu-hero": "Culinary Menu Spread",
  "menu": "Signature Feast",
  "moment-1": "Warm Hospitality Moment",
  "moment-2": "Table Banquet Spread",
  "moment-3": "Tandoor & Live Flame",
  "moment-4": "Intimate Dining Conversation",
  "moment-5": "Cocktail & Beverage Craft",
  "moment-6": "Family Feast & Laughter",
  "peacock": "Sukoon Mascot & Peacock Art",
  "people": "Sukoon Team & Guests",
  "sukoon": "Sukoon Official Logo",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTitle(filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, "");
  if (CUSTOM_TITLES[base]) {
    return CUSTOM_TITLES[base];
  }
  return base
    .replace(/^sukoon-/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  try {
    const isAdmin = await checkIsAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    const publicDir = path.join(process.cwd(), "public");
    const results: MediaFileItem[] = [];

    function scanDirectory(currentDir: string, relPath = "") {
      if (!fs.existsSync(currentDir)) return;
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const subRel = relPath ? `${relPath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scanDirectory(fullPath, subRel);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (IMAGE_EXTENSIONS.has(ext) && !IGNORED_FILES.has(entry.name)) {
            const stats = fs.statSync(fullPath);
            let folder: MediaFileItem["folder"] = "public";
            let category = "General Media";

            if (subRel.startsWith("images/")) {
              folder = "images";
              category = "Sukoon Photography";
            } else if (subRel.startsWith("uploads/")) {
              folder = "uploads";
              category = "Uploaded Media";
            } else if (subRel.startsWith("logo/")) {
              folder = "logo";
              category = "Brand Logos";
            }

            results.push({
              url: `/${subRel.replace(/\\/g, "/")}`,
              name: formatTitle(entry.name),
              filename: entry.name,
              folder,
              category,
              size: stats.size,
              formattedSize: formatSize(stats.size),
              modifiedAt: stats.mtimeMs,
            });
          }
        }
      }
    }

    scanDirectory(publicDir);

    // If Vercel Blob is enabled, also fetch all blobs uploaded to Vercel Storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobList = await list();
        for (const item of blobList.blobs) {
          results.push({
            url: item.url,
            name: formatTitle(item.pathname),
            filename: item.pathname,
            folder: "uploads",
            category: "Uploaded Media",
            size: item.size,
            formattedSize: formatSize(item.size),
            modifiedAt: new Date(item.uploadedAt).getTime(),
          });
        }
      } catch (err) {
        console.warn("Could not query Vercel Blob list:", err);
      }
    }

    // Sort: newest uploads first, then restaurant photography
    results.sort((a, b) => {
      if (a.folder === "uploads" && b.folder !== "uploads") return -1;
      if (b.folder === "uploads" && a.folder !== "uploads") return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      images: results,
    });
  } catch (error) {
    console.error("Error reading public media library:", error);
    return NextResponse.json(
      { error: "Failed to load public media files." },
      { status: 500 }
    );
  }
}
