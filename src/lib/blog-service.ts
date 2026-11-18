import fs from "fs";
import path from "path";
import { Blog, BlogFormData, BlogStats } from "@/types/blog";
import { generateSlug, calculateReadTime } from "./blog-utils";
import { connectToDatabase } from "./mongodb";
import { BlogModel, IBlog } from "@/models/Blog";

export { generateSlug, calculateReadTime };

const DATA_DIR = path.join(process.cwd(), "data");
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json");

const SEED_BLOGS: Blog[] = [];

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(BLOGS_FILE)) {
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(SEED_BLOGS, null, 2), "utf8");
  }
}

function readBlogsRaw(): Blog[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(BLOGS_FILE, "utf8");
    return JSON.parse(raw) as Blog[];
  } catch (error) {
    console.error("Failed to read blogs file:", error);
    return [];
  }
}

function writeBlogsRaw(blogs: Blog[]): void {
  ensureDataFile();
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf8");
}

function docToBlog(doc: IBlog): Blog {
  return {
    id: doc._id ? doc._id.toString() : doc.slug,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImage: doc.coverImage,
    category: doc.category,
    tags: doc.tags || [],
    author: {
      name: doc.author?.name || "Sukoon Culinary Team",
      role: doc.author?.role || "Kitchen Operations",
      avatar: doc.author?.avatar || "/images/people.png",
    },
    status: doc.status,
    featured: Boolean(doc.featured),
    readTime: doc.readTime || "4 min read",
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    seo: doc.seo,
  };
}

export async function getAllBlogs(options?: {
  status?: "all" | "published" | "draft";
  category?: string;
  search?: string;
  limit?: number;
}): Promise<Blog[]> {
  const { status = "all", category, search, limit } = options || {};

  const conn = await connectToDatabase();
  if (conn) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = {};
      if (status !== "all") {
        filter.status = status;
      }
      if (category && category !== "All") {
        filter.category = new RegExp(`^${category}$`, "i");
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
          { title: regex },
          { excerpt: regex },
          { category: regex },
          { tags: regex },
          { "author.name": regex },
        ];
      }

      let query = BlogModel.find(filter).sort({ featured: -1, publishedAt: -1 });
      if (limit && limit > 0) {
        query = query.limit(limit);
      }

      const docs = await query.exec();
      return docs.map(docToBlog);
    } catch (err) {
      console.warn("MongoDB getAllBlogs error, falling back to local file:", err);
    }
  }

  // Local fallback
  const blogs = readBlogsRaw();
  let filtered = blogs;

  if (status !== "all") {
    filtered = filtered.filter((b) => b.status === status);
  }

  if (category && category !== "All") {
    filtered = filtered.filter(
      (b) => b.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)) ||
        b.author.name.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  if (limit && limit > 0) {
    return filtered.slice(0, limit);
  }

  return filtered;
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      let doc = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        doc = await BlogModel.findById(id);
      }
      if (!doc) {
        doc = await BlogModel.findOne({ slug: id.toLowerCase() });
      }
      if (doc) {
        return docToBlog(doc);
      }
    } catch (err) {
      console.warn("MongoDB getBlogById error:", err);
    }
  }

  const blogs = readBlogsRaw();
  const found = blogs.find((b) => b.id === id || b.slug.toLowerCase() === id.toLowerCase());
  return found || null;
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const doc = await BlogModel.findOne({ slug: slug.toLowerCase() });
      if (doc) {
        return docToBlog(doc);
      }
    } catch (err) {
      console.warn("MongoDB getBlogBySlug error:", err);
    }
  }

  const blogs = readBlogsRaw();
  const found = blogs.find(
    (b) => b.slug.toLowerCase() === slug.toLowerCase()
  );
  return found || null;
}

export async function createBlog(data: BlogFormData): Promise<Blog> {
  let slug = data.slug && data.slug.trim() ? generateSlug(data.slug) : generateSlug(data.title);
  if (!slug) slug = `blog-${Date.now()}`;

  const conn = await connectToDatabase();
  if (conn) {
    try {
      // Ensure unique slug in MongoDB
      let uniqueSlug = slug;
      let counter = 1;
      while (await BlogModel.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const doc = await BlogModel.create({
        slug: uniqueSlug,
        title: data.title.trim(),
        excerpt: data.excerpt.trim(),
        content: data.content,
        coverImage: data.coverImage || "/images/behind-sukoon.png",
        category: data.category || "Culinary Heritage",
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: {
          name: data.author?.name || "Sukoon Team",
          role: data.author?.role || "Kitchen Operations",
          avatar: data.author?.avatar || "/images/people.png",
        },
        status: data.status || "published",
        featured: Boolean(data.featured),
        readTime: data.readTime || calculateReadTime(data.content),
        publishedAt: new Date(),
        seo: {
          metaTitle: data.title.trim(),
          metaDescription: data.excerpt.trim(),
        },
      });

      const newBlog = docToBlog(doc);

      // Keep local JSON in sync
      const blogs = readBlogsRaw();
      blogs.unshift(newBlog);
      writeBlogsRaw(blogs);

      return newBlog;
    } catch (err) {
      console.warn("MongoDB createBlog error, using fallback:", err);
    }
  }

  // Fallback
  const blogs = readBlogsRaw();
  let uniqueSlug = slug;
  let counter = 1;
  while (blogs.some((b) => b.slug.toLowerCase() === uniqueSlug.toLowerCase())) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();
  const newBlog: Blog = {
    id: `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug: uniqueSlug,
    title: data.title.trim(),
    excerpt: data.excerpt.trim(),
    content: data.content,
    coverImage: data.coverImage || "/images/behind-sukoon.png",
    category: data.category || "Culinary Heritage",
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: {
      name: data.author?.name || "Sukoon Team",
      role: data.author?.role || "Kitchen Operations",
      avatar: data.author?.avatar || "/images/people.png",
    },
    status: data.status || "published",
    featured: Boolean(data.featured),
    readTime: data.readTime || calculateReadTime(data.content),
    publishedAt: now,
    updatedAt: now,
    seo: {
      metaTitle: data.title.trim(),
      metaDescription: data.excerpt.trim(),
    },
  };

  blogs.unshift(newBlog);
  writeBlogsRaw(blogs);
  return newBlog;
}

export async function updateBlog(
  id: string,
  data: Partial<BlogFormData>
): Promise<Blog | null> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = { ...data, updatedAt: new Date() };
      if (data.slug) {
        updateData.slug = generateSlug(data.slug);
      }
      if (data.content && !data.readTime) {
        updateData.readTime = calculateReadTime(data.content);
      }

      let updatedDoc = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        updatedDoc = await BlogModel.findByIdAndUpdate(id, updateData, { new: true });
      }
      if (!updatedDoc) {
        updatedDoc = await BlogModel.findOneAndUpdate({ slug: id.toLowerCase() }, updateData, { new: true });
      }

      if (updatedDoc) {
        const blogObj = docToBlog(updatedDoc);
        // Sync local
        const blogs = readBlogsRaw();
        const idx = blogs.findIndex((b) => b.id === id || b.slug === id);
        if (idx !== -1) {
          blogs[idx] = blogObj;
          writeBlogsRaw(blogs);
        }
        return blogObj;
      }
    } catch (err) {
      console.warn("MongoDB updateBlog error, using fallback:", err);
    }
  }

  // Fallback
  const blogs = readBlogsRaw();
  const index = blogs.findIndex((b) => b.id === id || b.slug === id);
  if (index === -1) return null;

  const existing = blogs[index];
  let slug = existing.slug;

  if (data.slug && data.slug.trim() && data.slug !== existing.slug) {
    const candidate = generateSlug(data.slug);
    let uniqueSlug = candidate;
    let counter = 1;
    while (
      blogs.some(
        (b) => b.id !== id && b.slug.toLowerCase() === uniqueSlug.toLowerCase()
      )
    ) {
      uniqueSlug = `${candidate}-${counter}`;
      counter++;
    }
    slug = uniqueSlug;
  }

  const updated: Blog = {
    ...existing,
    title: data.title !== undefined ? data.title.trim() : existing.title,
    slug,
    excerpt: data.excerpt !== undefined ? data.excerpt.trim() : existing.excerpt,
    content: data.content !== undefined ? data.content : existing.content,
    coverImage: data.coverImage !== undefined ? data.coverImage : existing.coverImage,
    category: data.category !== undefined ? data.category : existing.category,
    tags: data.tags !== undefined ? data.tags : existing.tags,
    author: {
      name: data.author?.name ?? existing.author.name,
      role: data.author?.role ?? existing.author.role,
      avatar: data.author?.avatar ?? existing.author.avatar,
    },
    status: data.status !== undefined ? data.status : existing.status,
    featured: data.featured !== undefined ? Boolean(data.featured) : existing.featured,
    readTime:
      data.readTime ||
      (data.content ? calculateReadTime(data.content) : existing.readTime),
    updatedAt: new Date().toISOString(),
  };

  blogs[index] = updated;
  writeBlogsRaw(blogs);
  return updated;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      let res = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        res = await BlogModel.findByIdAndDelete(id);
      }
      if (!res) {
        res = await BlogModel.findOneAndDelete({ slug: id.toLowerCase() });
      }
      if (res) {
        const blogs = readBlogsRaw();
        const nextBlogs = blogs.filter((b) => b.id !== id && b.slug !== id);
        writeBlogsRaw(nextBlogs);
        return true;
      }
    } catch (err) {
      console.warn("MongoDB deleteBlog error, using fallback:", err);
    }
  }

  // Fallback
  const blogs = readBlogsRaw();
  const nextBlogs = blogs.filter((b) => b.id !== id && b.slug !== id);
  if (nextBlogs.length === blogs.length) {
    return false;
  }
  writeBlogsRaw(nextBlogs);
  return true;
}

export async function getBlogStats(): Promise<BlogStats> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const total = await BlogModel.countDocuments();
      const published = await BlogModel.countDocuments({ status: "published" });
      const draft = await BlogModel.countDocuments({ status: "draft" });

      const categoryAgg = await BlogModel.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
      ]);

      return {
        total,
        published,
        draft,
        categories: categoryAgg,
      };
    } catch (err) {
      console.warn("MongoDB getBlogStats error, using fallback:", err);
    }
  }

  // Fallback
  const blogs = readBlogsRaw();
  const categoryCounts: Record<string, number> = {};

  let published = 0;
  let draft = 0;

  for (const b of blogs) {
    if (b.status === "published") published++;
    else if (b.status === "draft") draft++;

    const cat = b.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    total: blogs.length,
    published,
    draft,
    categories,
  };
}

export async function getBlogCategories(): Promise<string[]> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const distinct = await BlogModel.distinct("category");
      if (distinct && distinct.length > 0) {
        return distinct as string[];
      }
    } catch (err) {
      console.warn("MongoDB getBlogCategories error, using fallback:", err);
    }
  }

  const blogs = readBlogsRaw();
  const set = new Set<string>();
  blogs.forEach((b) => {
    if (b.category) set.add(b.category);
  });
  return Array.from(set);
}
