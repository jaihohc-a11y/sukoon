"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Clock, Calendar, ArrowRight, Sparkles, BookOpen, UtensilsCrossed } from "lucide-react";
import { Blog } from "@/types/blog";

interface BlogsExplorerProps {
  initialBlogs: Blog[];
  categories: string[];
}

export default function BlogsExplorer({
  initialBlogs,
  categories,
}: BlogsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((blog) => {
      if (
        selectedCategory !== "All" &&
        blog.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = blog.title.toLowerCase().includes(q);
        const matchesExcerpt = blog.excerpt.toLowerCase().includes(q);
        const matchesCategory = blog.category.toLowerCase().includes(q);
        const matchesTag = blog.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesCategory && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [initialBlogs, selectedCategory, search]);

  // Featured blog (first featured blog, or first blog)
  const featuredBlog = useMemo(() => {
    if (selectedCategory !== "All" || search.trim()) return null;
    return initialBlogs.find((b) => b.featured) || initialBlogs[0] || null;
  }, [initialBlogs, selectedCategory, search]);

  const regularBlogs = useMemo(() => {
    if (!featuredBlog) return filteredBlogs;
    return filteredBlogs.filter((b) => b.id !== featuredBlog.id);
  }, [filteredBlogs, featuredBlog]);

  if (initialBlogs.length === 0) {
    return (
      <div className="py-24 px-6 text-center border border-[#DDB789]/20 rounded-3xl bg-[#1d2002]/40 max-w-3xl mx-auto shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-[#DDB789]/15 border border-[#DDB789]/30 flex items-center justify-center mx-auto text-[#DDB789] mb-4">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-charman-serif-light text-[#F4EDE2]">
          Stories from the Hearth Coming Soon
        </h3>
        <p className="mt-3 text-sm sm:text-base text-[#F4EDE2]/70 font-instrument-regular max-w-lg mx-auto leading-relaxed">
          Our culinary team is preparing thoughtful essays on Indian culinary heritage, slow flame techniques, and spice discoveries. Check back soon.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#DDB789] text-[#1d2002] font-semibold text-xs tracking-wider uppercase hover:bg-[#ebd0b0] transition-colors"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Explore Our Menu</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#DDB789]/30 text-[#DDB789] font-semibold text-xs tracking-wider uppercase hover:border-[#DDB789] hover:bg-[#DDB789]/10 transition-colors"
          >
            <span>Visit Us in Richmond</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Category Pills & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#DDB789]/20">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-instrument-regular transition-all cursor-pointer ${
                  active
                    ? "bg-[#DDB789] text-[#1d2002] font-semibold shadow-md"
                    : "border border-[#DDB789]/30 text-[#F4EDE2]/80 hover:border-[#DDB789] hover:text-[#DDB789]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-[#DDB789] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories, spices..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#1d2002]/80 border border-[#DDB789]/30 rounded-full text-xs sm:text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/40 focus:outline-none focus:border-[#DDB789] transition-colors"
          />
        </div>
      </div>

      {/* Featured Article Card */}
      {featuredBlog && (
        <div className="relative rounded-3xl overflow-hidden border border-[#DDB789]/30 bg-[#252805] shadow-2xl group transition-all duration-500 hover:border-[#DDB789]/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
            {/* Image Column */}
            <div className="lg:col-span-7 relative overflow-hidden h-72 lg:h-auto">
              <img
                src={featuredBlog.coverImage}
                alt={featuredBlog.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#252805] via-transparent to-transparent lg:hidden" />
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-[#1d2002]/90 border border-[#DDB789]/40 text-[#DDB789] text-xs font-semibold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#DDB789]" />
                  <span>Featured Chronicle</span>
                </span>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-[#DDB789] font-medium mb-3">
                  <span className="uppercase tracking-widest">
                    {featuredBlog.category}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#F4EDE2]/60">
                    <Clock className="w-3 h-3" />
                    <span>{featuredBlog.readTime}</span>
                  </span>
                </div>

                <Link href={`/blogs/${featuredBlog.slug}`}>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-charman-serif-light text-[#F4EDE2] group-hover:text-[#DDB789] transition-colors leading-tight">
                    {featuredBlog.title}
                  </h2>
                </Link>

                <p className="mt-4 text-sm sm:text-base text-[#F4EDE2]/75 font-instrument-regular leading-relaxed line-clamp-4">
                  {featuredBlog.excerpt}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#DDB789]/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#DDB789]/20 border border-[#DDB789]/40 flex items-center justify-center text-[#DDB789] text-xs font-bold">
                    SK
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#F4EDE2]">
                      {featuredBlog.author.name}
                    </div>
                    <div className="text-[11px] text-[#F4EDE2]/50">
                      {new Date(featuredBlog.publishedAt).toLocaleDateString(
                        "en-AU",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/blogs/${featuredBlog.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DDB789] text-[#1d2002] font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:bg-[#ebd0b0] hover:scale-105 shadow-md"
                >
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      {filteredBlogs.length === 0 ? (
        <div className="py-24 text-center border border-[#DDB789]/20 rounded-3xl bg-[#1d2002]/40 p-8">
          <BookOpen className="w-12 h-12 mx-auto text-[#DDB789]/40 mb-3" />
          <h3 className="text-xl font-charman-serif-light text-[#F4EDE2]">
            No stories match your search
          </h3>
          <p className="mt-2 text-sm text-[#F4EDE2]/60 max-w-md mx-auto">
            We couldn't find any articles matching &ldquo;{search}&rdquo;. Try another
            keyword or clear your active category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            className="mt-6 px-6 py-2.5 rounded-full bg-[#DDB789] text-[#1d2002] font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#edd4b6]"
          >
            Show All Stories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(featuredBlog ? regularBlogs : filteredBlogs).map((blog) => (
            <article
              key={blog.id}
              className="flex flex-col rounded-3xl overflow-hidden border border-[#DDB789]/20 bg-[#1d2002]/60 transition-all duration-300 hover:border-[#DDB789]/60 hover:-translate-y-1 shadow-xl group"
            >
              <Link
                href={`/blogs/${blog.slug}`}
                className="relative block aspect-[16/10] overflow-hidden bg-neutral-900"
              >
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full bg-[#1d2002]/90 border border-[#DDB789]/30 text-[#DDB789] text-[11px] font-medium tracking-wide uppercase backdrop-blur-sm">
                    {blog.category}
                  </span>
                </div>
              </Link>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-[#F4EDE2]/50 mb-3 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#DDB789]" />
                      <span>
                        {new Date(blog.publishedAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#DDB789]" />
                      <span>{blog.readTime}</span>
                    </span>
                  </div>

                  <Link href={`/blogs/${blog.slug}`}>
                    <h3 className="text-xl sm:text-2xl font-charman-serif-light text-[#F4EDE2] group-hover:text-[#DDB789] transition-colors leading-snug line-clamp-2">
                      {blog.title}
                    </h3>
                  </Link>

                  <p className="mt-3 text-xs sm:text-sm text-[#F4EDE2]/70 font-instrument-regular line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#DDB789]/15 flex items-center justify-between">
                  <span className="text-xs text-[#F4EDE2]/60 truncate max-w-[150px]">
                    {blog.author.name}
                  </span>
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#DDB789] font-medium hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
