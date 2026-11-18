"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  Tag,
  Plus,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Blog, BlogStats } from "@/types/blog";

export default function AdminDashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [blogsRes, statsRes] = await Promise.all([
        fetch("/api/blogs?status=all"),
        fetch("/api/admin/stats"),
      ]);

      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData.blogs || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        fetchDashboardData();
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
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-2 border-[#DDB789]/30 border-t-[#DDB789] rounded-full animate-spin" />
        <p className="mt-3 text-xs uppercase tracking-widest text-[#DDB789]">
          Loading Editorial Insights...
        </p>
      </div>
    );
  }

  const publishedCount = stats?.published ?? blogs.filter((b) => b.status === "published").length;
  const draftCount = stats?.draft ?? blogs.filter((b) => b.status === "draft").length;
  const totalCount = stats?.total ?? blogs.length;
  const categoriesCount = stats?.categories?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#202405] via-[#2a1705] to-[#1a1c04] border border-[#DDB789]/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo/sukoon.svg" alt="Sukoon" className="h-5 w-auto" />
              <span className="w-px h-3 bg-[#DDB789]/30" />
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#DDB789] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Editorial Suite</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-charman-serif-light text-[#F4EDE2] leading-tight">
              Flavours That Comfort The Soul
            </h1>
            <p className="mt-2 text-sm text-[#F4EDE2]/70 leading-relaxed">
              Craft captivating culinary essays, announce new seasonal menus, and share the art of slow-cooked Indian dining with our patrons.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/blogs/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DDB789] hover:bg-[#ebc99d] text-[#141604] font-semibold text-sm shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Article</span>
            </Link>
            <Link
              href="/blogs"
              target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#DDB789]/30 hover:border-[#DDB789] text-[#F4EDE2] text-sm hover:text-[#DDB789] transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Public Journal</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#DDB789]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#F4EDE2]/50 font-medium">
              Total Articles
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#DDB789]/10 flex items-center justify-center text-[#DDB789]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-charman-serif-light text-[#F4EDE2]">
            {totalCount}
          </div>
          <div className="mt-1 text-xs text-[#F4EDE2]/50 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#DDB789]" />
            <span>All articles in archive</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-medium">
              Live & Published
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-charman-serif-light text-[#F4EDE2]">
            {publishedCount}
          </div>
          <div className="mt-1 text-xs text-emerald-400/80">
            Visible on public website
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
              Drafts in Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-charman-serif-light text-[#F4EDE2]">
            {draftCount}
          </div>
          <div className="mt-1 text-xs text-amber-400/80">
            Work in progress / Private
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#F4EDE2]/50 font-medium">
              Categories
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#DDB789]/10 flex items-center justify-center text-[#DDB789]">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-charman-serif-light text-[#F4EDE2]">
            {categoriesCount}
          </div>
          <div className="mt-1 text-xs text-[#F4EDE2]/50">
            Culinary topics covered
          </div>
        </div>
      </div>

      {/* Recent Blogs Section */}
      <div className="rounded-2xl bg-[#141604] border border-[#DDB789]/15 overflow-hidden shadow-lg">
        <div className="p-5 sm:p-6 border-b border-[#DDB789]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-charman-serif-light text-[#F4EDE2]">
              Recent Articles
            </h2>
            <p className="text-xs text-[#F4EDE2]/60 mt-0.5">
              Review, edit, publish or delete articles published to the public journal.
            </p>
          </div>
          <Link
            href="/admin/blogs"
            className="flex items-center gap-1.5 text-xs text-[#DDB789] hover:underline font-medium w-fit"
          >
            <span>View All ({blogs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className="py-16 text-center text-[#F4EDE2]/60">
            <BookOpen className="w-10 h-10 mx-auto text-[#DDB789]/40 mb-3" />
            <p className="text-sm">No articles have been created yet.</p>
            <Link
              href="/admin/blogs/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#DDB789] text-[#141604] rounded-full text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Blog</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101203] text-[#F4EDE2]/50 uppercase tracking-wider text-[10px] border-b border-[#DDB789]/10">
                <tr>
                  <th className="py-3.5 px-5">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDB789]/10">
                {blogs.slice(0, 6).map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-[#1a1c04]/80 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={blog.coverImage || "/images/behind-sukoon.png"}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-neutral-900 border border-[#DDB789]/15 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <div className="font-medium text-[#F4EDE2] text-sm truncate">
                            {blog.title}
                          </div>
                          <div className="text-[11px] text-[#F4EDE2]/50 truncate mt-0.5">
                            /{blog.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#DDB789]/10 border border-[#DDB789]/20 text-[#DDB789] text-[11px]">
                        {blog.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#F4EDE2]/70">
                      {blog.author.name}
                    </td>
                    <td className="py-4 px-4">
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
                    <td className="py-4 px-4 text-[#F4EDE2]/50 whitespace-nowrap">
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
                            className="p-1.5 text-[#F4EDE2]/60 hover:text-[#DDB789] hover:bg-[#DDB789]/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blogs/edit/${blog.id}`}
                          title="Edit Article"
                          className="p-1.5 text-[#F4EDE2]/60 hover:text-white hover:bg-[#DDB789]/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(blog.id, blog.title)}
                          disabled={deletingId === blog.id}
                          title="Delete Article"
                          className="p-1.5 text-[#F4EDE2]/60 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
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

      {/* Editorial Categories & Tips Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Breakdown */}
        <div className="p-6 rounded-2xl bg-[#141604] border border-[#DDB789]/15">
          <h3 className="text-base font-charman-serif-light text-[#F4EDE2] mb-3">
            Category Breakdown
          </h3>
          <div className="space-y-2.5">
            {stats?.categories && stats.categories.length > 0 ? (
              stats.categories.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e1002] border border-[#DDB789]/10 text-xs"
                >
                  <span className="text-[#F4EDE2] font-medium">{c.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DDB789]/15 text-[#DDB789] font-semibold">
                    {c.count} {c.count === 1 ? "article" : "articles"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#F4EDE2]/50">No categories recorded yet.</p>
            )}
          </div>
        </div>

        {/* Storytelling Tips Card */}
        <div className="p-6 rounded-2xl bg-[#141604] border border-[#DDB789]/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#DDB789] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Sukoon Storytelling Guide</span>
            </div>
            <h3 className="text-base font-charman-serif-light text-[#F4EDE2]">
              Connecting with Guests Through Words
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-[#F4EDE2]/70 leading-relaxed list-disc list-inside">
              <li>Highlight the aroma and textures: evoke the sizzle of cumin seeds and charcoal warmth.</li>
              <li>Share origin stories: demystify the royal techniques like Awadhi Dum Pukht.</li>
              <li>Incorporate wine and cocktail pairings to encourage multi-course dining.</li>
            </ul>
          </div>
          <div className="mt-5 pt-4 border-t border-[#DDB789]/10 flex items-center justify-between">
            <span className="text-[11px] text-[#F4EDE2]/50">Need to draft a new story?</span>
            <Link
              href="/admin/blogs/new"
              className="text-xs text-[#DDB789] font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Open Composer</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
