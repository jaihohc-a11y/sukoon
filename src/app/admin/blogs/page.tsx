"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Blog } from "@/types/blog";

export default function AdminBlogsListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blogs?status=all");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ["All", ...Array.from(set)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      // Status filter
      if (statusFilter !== "all" && blog.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== "All" && blog.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = blog.title.toLowerCase().includes(q);
        const matchesExcerpt = blog.excerpt.toLowerCase().includes(q);
        const matchesAuthor = blog.author.name.toLowerCase().includes(q);
        const matchesCategory = blog.category.toLowerCase().includes(q);
        const matchesTag = blog.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesAuthor && !matchesCategory && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [blogs, statusFilter, categoryFilter, search]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert("Failed to delete blog post.");
      }
    } catch {
      alert("Error deleting blog post.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (blog: Blog) => {
    const nextStatus = blog.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: nextStatus } : b))
        );
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDB789]/15">
        <div>
          <h1 className="text-2xl sm:text-3xl font-charman-serif-light text-[#F4EDE2]">
            Articles & Stories
          </h1>
          <p className="text-xs sm:text-sm text-[#F4EDE2]/60 mt-1">
            Manage, edit, publish and curate all journal entries for Sukoon Indian Restaurant.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DDB789] hover:bg-[#ebc99d] text-[#141604] font-semibold text-sm shadow-md transition-transform hover:scale-[1.02] w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#141604] border border-[#DDB789]/15 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0c0d02] rounded-xl border border-[#DDB789]/10 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex-1 md:flex-initial ${
              statusFilter === "all"
                ? "bg-[#DDB789] text-[#141604] font-semibold shadow-sm"
                : "text-[#F4EDE2]/70 hover:text-white"
            }`}
          >
            All ({blogs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex-1 md:flex-initial flex items-center justify-center gap-1.5 ${
              statusFilter === "published"
                ? "bg-emerald-500 text-[#141604] font-semibold shadow-sm"
                : "text-[#F4EDE2]/70 hover:text-emerald-400"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Published ({blogs.filter((b) => b.status === "published").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex-1 md:flex-initial flex items-center justify-center gap-1.5 ${
              statusFilter === "draft"
                ? "bg-amber-500 text-[#141604] font-semibold shadow-sm"
                : "text-[#F4EDE2]/70 hover:text-amber-400"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Drafts ({blogs.filter((b) => b.status === "draft").length})</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 text-[#DDB789] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#0c0d02] border border-[#DDB789]/20 rounded-xl text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789] appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#141604] text-[#F4EDE2]">
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag, author..."
              className="w-full pl-9 pr-4 py-2 bg-[#0c0d02] border border-[#DDB789]/20 rounded-xl text-xs text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
            />
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="rounded-2xl bg-[#141604] border border-[#DDB789]/15 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[#DDB789]/30 border-t-[#DDB789] rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-xs uppercase tracking-widest text-[#DDB789]">
              Loading Articles...
            </p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-20 text-center text-[#F4EDE2]/60 px-4">
            <BookOpen className="w-12 h-12 mx-auto text-[#DDB789]/30 mb-3" />
            <h3 className="text-base font-medium text-[#F4EDE2]">
              No articles match your criteria
            </h3>
            <p className="text-xs text-[#F4EDE2]/50 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, clearing filters, or create a brand new blog post.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(search || statusFilter !== "all" || categoryFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setCategoryFilter("All");
                  }}
                  className="px-4 py-2 rounded-full border border-[#DDB789]/30 text-xs text-[#F4EDE2] hover:border-[#DDB789] cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <Link
                href="/admin/blogs/new"
                className="px-4 py-2 rounded-full bg-[#DDB789] text-[#141604] text-xs font-semibold hover:bg-[#ebc99d]"
              >
                + Create Blog
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101203] text-[#F4EDE2]/50 uppercase tracking-wider text-[10px] border-b border-[#DDB789]/10">
                <tr>
                  <th className="py-3.5 px-5">Story & Slug</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Read Time</th>
                  <th className="py-3.5 px-4">Published</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDB789]/10">
                {filteredBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-[#1a1c04]/80 transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={blog.coverImage || "/images/behind-sukoon.png"}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover bg-neutral-900 border border-[#DDB789]/15 shrink-0 mt-0.5"
                        />
                        <div className="min-w-0 max-w-sm lg:max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#F4EDE2] text-sm group-hover:text-[#DDB789] transition-colors truncate">
                              {blog.title}
                            </span>
                            {blog.featured && (
                              <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1 border border-amber-400/30">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Featured</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#F4EDE2]/50 truncate mt-0.5 font-mono">
                            /{blog.slug}
                          </div>
                          <p className="text-[11px] text-[#F4EDE2]/60 line-clamp-1 mt-1">
                            {blog.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-[#DDB789]/10 border border-[#DDB789]/20 text-[#DDB789] text-[11px] font-medium">
                        {blog.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-[#F4EDE2]/80">
                      <div>{blog.author.name}</div>
                      {blog.author.role && (
                        <div className="text-[10px] text-[#F4EDE2]/40">
                          {blog.author.role}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(blog)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                          blog.status === "published"
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60"
                            : "bg-amber-950/60 text-amber-300 border border-amber-500/30 hover:bg-amber-900/60"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            blog.status === "published"
                              ? "bg-emerald-400 animate-pulse"
                              : "bg-amber-400"
                          }`}
                        />
                        <span className="capitalize">{blog.status}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-[#F4EDE2]/60">
                      {blog.readTime || "4 min read"}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-[#F4EDE2]/50">
                      {new Date(blog.publishedAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {blog.status === "published" && (
                          <Link
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            title="View Public Story"
                            className="p-2 text-[#F4EDE2]/60 hover:text-[#DDB789] hover:bg-[#DDB789]/10 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blogs/edit/${blog.id}`}
                          title="Edit Article"
                          className="p-2 text-[#F4EDE2]/60 hover:text-white hover:bg-[#DDB789]/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(blog.id, blog.title)}
                          disabled={deletingId === blog.id}
                          title="Delete Article"
                          className="p-2 text-[#F4EDE2]/60 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
