import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChefHat,
  Bookmark,
  UtensilsCrossed,
} from "lucide-react";
import { getBlogBySlug, getAllBlogs } from "@/lib/blog-service";
import { checkIsAdminServer } from "@/lib/admin-auth";
import ArticleContent from "../components/ArticleContent";
import ShareButtons from "../components/ShareButtons";
import SlowDown from "../../home/components/SlowDown";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Story Not Found | Sukoon",
    };
  }

  return {
    title: `${blog.title} | Sukoon Restaurant`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: [blog.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // If blog is draft, check if admin is viewing
  if (blog.status === "draft") {
    const isAdmin = await checkIsAdminServer();
    if (!isAdmin) {
      notFound();
    }
  }

  // Fetch related articles (other published stories)
  const allBlogs = await getAllBlogs({ status: "published" });
  const relatedBlogs = allBlogs
    .filter((b) => b.id !== blog.id)
    .slice(0, 3);

  return (
    <div className="bg-[#1d2002] text-[#F4EDE2] min-h-screen">
      {/* Top Breadcrumb & Navigation */}
      <div className="pt-28 md:pt-36 px-7.5 sm:px-13 container-px w-full max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between gap-4 py-4 border-b border-[#DDB789]/20 text-xs sm:text-sm text-[#F4EDE2]/60 font-instrument-regular">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-[#DDB789] hover:underline font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Chronicles</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blogs" className="hover:text-white transition-colors">
              Chronicles
            </Link>
            <span>/</span>
            <span className="text-[#DDB789] truncate max-w-xs md:max-w-md">
              {blog.title}
            </span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <header className="pt-10 pb-12 px-7.5 sm:px-13 container-px w-full max-w-[1920px] mx-auto">
        {/* Category & Date Pill */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#DDB789] font-medium mb-6 font-instrument-regular">
          <span className="px-4 py-1.5 rounded-full bg-[#2a2e04] border border-[#DDB789]/30 uppercase tracking-widest text-xs font-semibold">
            {blog.category}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-[#F4EDE2]/70">
            <Calendar className="w-3.5 h-3.5 text-[#DDB789]" />
            <span>
              {new Date(blog.publishedAt).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-[#F4EDE2]/70">
            <Clock className="w-3.5 h-3.5 text-[#DDB789]" />
            <span>{blog.readTime}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-charman-serif-light text-[#F4EDE2] leading-[1.15] tracking-tight max-w-6xl">
          {blog.title}
        </h1>

        {/* Subtitle / Excerpt */}
        {blog.excerpt && (
          <p className="mt-6 text-base sm:text-xl md:text-2xl text-[#EBD2B1] font-instrument-regular leading-relaxed italic max-w-5xl">
            {blog.excerpt}
          </p>
        )}

        {/* Author Byline & Social Share Bar */}
        <div className="mt-10 pt-6 border-t border-[#DDB789]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#DDB789]/20 border border-[#DDB789]/40 flex items-center justify-center text-[#DDB789] font-bold text-base shrink-0">
              SK
            </div>
            <div>
              <div className="text-base font-semibold text-[#F4EDE2] font-instrument-regular">
                {blog.author.name}
              </div>
              <div className="text-xs sm:text-sm text-[#DDB789] font-instrument-regular">
                {blog.author.role || "Sukoon Culinary Team"}
              </div>
            </div>
          </div>

          <div className="flex items-center sm:justify-end">
            <ShareButtons title={blog.title} slug={blog.slug} />
          </div>
        </div>
      </header>

      {/* Hero Cover Image (Full Width Container) */}
      {blog.coverImage && (
        <div className="px-7.5 sm:px-13 container-px w-full max-w-[1920px] mx-auto mb-16">
          <div className="relative rounded-3xl overflow-hidden border border-[#DDB789]/30 shadow-2xl aspect-[21/9] md:aspect-[24/10] max-h-[620px] bg-neutral-900 w-full">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Main Content Area (Spacious 12-Column Layout) */}
      <main className="px-7.5 sm:px-13 container-px w-full max-w-[1920px] mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">
          {/* Main Reading Column (8 cols) */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-12">
            <ArticleContent content={blog.content} />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="pt-8 border-t border-[#DDB789]/20 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#F4EDE2]/50 font-medium mr-2 font-instrument-regular">
                  Key Topics:
                </span>
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full bg-[#2a2e04] border border-[#DDB789]/20 text-[#DDB789] text-xs font-medium font-instrument-regular"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Share Bar */}
            <div className="pt-6 border-t border-[#DDB789]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-sm text-[#F4EDE2]/70 font-instrument-regular">
                Found comfort in this story? Share it with friends.
              </span>
              <ShareButtons title={blog.title} slug={blog.slug} />
            </div>

            {/* Author Bio Box */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#242805] border border-[#DDB789]/25 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-[#DDB789]/20 border-2 border-[#DDB789]/40 flex items-center justify-center text-[#DDB789] font-bold text-lg shrink-0">
                <ChefHat className="w-8 h-8 text-[#DDB789]" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-charman-serif-light text-[#F4EDE2]">
                    {blog.author.name}
                  </h3>
                  <span className="px-3 py-0.5 rounded-full bg-[#DDB789]/20 text-[#DDB789] text-xs font-semibold">
                    Culinary Creators
                  </span>
                </div>
                <p className="text-sm text-[#DDB789] font-instrument-regular">
                  {blog.author.role || "Sukoon Indian Restaurant, Melbourne"}
                </p>
                <p className="text-sm sm:text-base text-[#F4EDE2]/75 leading-relaxed font-instrument-regular pt-1">
                  Rooted in centuries-old royal Awadhi and North Indian traditions, our culinary team focuses on slow simmered gravies, live charcoal cooking, and freshly hand-ground spices to comfort the spirit.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Editorial Sidebar (4 cols) */}
          <aside className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-32 space-y-8">
            {/* Story Overview Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#242805] border border-[#DDB789]/25 shadow-xl space-y-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#DDB789] font-semibold pb-4 border-b border-[#DDB789]/15">
                <Bookmark className="w-4 h-4 text-[#DDB789]" />
                <span>Story Overview</span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm font-instrument-regular">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDB789]/10">
                  <span className="text-[#F4EDE2]/50">Category</span>
                  <span className="text-[#DDB789] font-semibold">{blog.category}</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#DDB789]/10">
                  <span className="text-[#F4EDE2]/50">Read Time</span>
                  <span className="text-[#F4EDE2]">{blog.readTime}</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#DDB789]/10">
                  <span className="text-[#F4EDE2]/50">Published</span>
                  <span className="text-[#F4EDE2]">
                    {new Date(blog.publishedAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#F4EDE2]/50">Author</span>
                  <span className="text-[#F4EDE2] truncate max-w-[180px]">{blog.author.name}</span>
                </div>
              </div>
            </div>

            {/* Reserve a Table CTA Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-[#481904] via-[#351403] to-[#1d2002] border border-[#DDB789]/30 shadow-2xl text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-[#DDB789]/20 border border-[#DDB789]/40 flex items-center justify-center mx-auto text-[#DDB789]">
                <UtensilsCrossed className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-charman-serif-light text-[#F4EDE2]">
                  Join Us for Dinner
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#F4EDE2]/70 leading-relaxed font-instrument-regular">
                  Reserve your table on Swan Street to experience our slow-simmered dishes, freshly baked naans, and warm hospitality.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="https://sukoonindianrestaurant.square.site"
                  target="_blank"
                  className="block w-full py-3 px-6 rounded-full bg-[#DDB789] text-[#1d2002] font-semibold text-xs tracking-wider uppercase hover:bg-[#edd4b6] transition-transform hover:scale-[1.02] shadow-md"
                >
                  Order Online
                </Link>
                <Link
                  href="/menu"
                  className="block w-full py-3 px-6 rounded-full border border-[#DDB789]/40 text-[#DDB789] font-semibold text-xs tracking-wider uppercase hover:border-[#DDB789] hover:bg-[#DDB789]/10 transition-colors"
                >
                  View Full Menu
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Related Articles Section */}
      {relatedBlogs.length > 0 && (
        <section className="bg-[#181a03] py-20 border-t border-[#DDB789]/15">
          <div className="px-7.5 sm:px-13 container-px w-full max-w-[1920px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#DDB789] font-medium font-instrument-regular">
                  Keep Reading
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-charman-serif-light text-[#F4EDE2]">
                  More Stories from Sukoon
                </h2>
              </div>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#DDB789] hover:underline font-medium font-instrument-regular"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blogs/${rel.slug}`}
                  className="group rounded-3xl overflow-hidden bg-[#212404] border border-[#DDB789]/20 hover:border-[#DDB789]/50 transition-all flex flex-col shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-900">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-[#DDB789] font-semibold uppercase tracking-wider mb-2 font-instrument-regular">
                        {rel.category}
                      </div>
                      <h3 className="text-lg sm:text-xl font-charman-serif-light text-[#F4EDE2] group-hover:text-[#DDB789] transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-[#F4EDE2]/60 line-clamp-2 leading-relaxed font-instrument-regular">
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#DDB789]/10 text-xs text-[#F4EDE2]/50 flex items-center justify-between font-instrument-regular">
                      <span>{rel.readTime}</span>
                      <span className="text-[#DDB789] font-semibold group-hover:translate-x-1 transition-transform">
                        Read Story →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dine With Us CTA Banner */}
      <div className="py-20 bg-[#2b1003] border-t border-[#DDB789]/20 px-7.5 sm:px-13 container-px w-full text-center">
        <div className="max-w-3xl mx-auto">
          <Sparkles className="w-6 h-6 text-[#DDB789] mx-auto mb-3" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-charman-serif-light text-[#F4EDE2]">
            Experience These Flavours in Person
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#F4EDE2]/70 font-instrument-regular leading-relaxed">
            Reserve your table for an evening of slow-cooked curries, charcoal-kissed naans, and curated wines in our Richmond dining room.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="https://sukoonindianrestaurant.square.site"
              target="_blank"
              className="px-8 py-3 rounded-full bg-[#DDB789] text-[#1d2002] font-semibold text-xs tracking-wider uppercase hover:bg-[#edd4b6] transition-transform hover:scale-105 shadow-lg"
            >
              Order Online
            </Link>
            <Link
              href="/menu"
              className="px-8 py-3 rounded-full border border-[#DDB789]/40 text-[#DDB789] font-semibold text-xs tracking-wider uppercase hover:border-[#DDB789] hover:bg-[#DDB789]/10 transition-colors"
            >
              Explore Our Menu
            </Link>
          </div>
        </div>
      </div>

      <SlowDown />
    </div>
  );
}
