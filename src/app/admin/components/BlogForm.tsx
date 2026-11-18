"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Heading,
  Bold,
  Italic,
  Quote,
  List,
  ListOrdered,
  Minus,
  Code,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Calendar,
  Clock,
  User,
  Upload,
  X,
  Link2,
  AlertCircle,
  Loader2,
  Search,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Blog, BlogFormData } from "@/types/blog";
import { calculateReadTime, generateSlug } from "@/lib/blog-utils";

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

const PRESET_IMAGES = [
  { label: "Kitchen Hearth", url: "/images/behind-sukoon.png" },
  { label: "Slow Cooking", url: "/images/exp-1.jpg" },
  { label: "Dining Ambience", url: "/images/hero-image.png" },
  { label: "Tandoor & Flame", url: "/images/moment-3.png" },
  { label: "Feast & Wine", url: "/images/JOHN8821.jpg" },
  { label: "Artisan Plating", url: "/images/about-dish.png" },
];

const DEFAULT_CATEGORIES = [
  "Culinary Heritage",
  "Behind the Scenes",
  "Ingredients & Spices",
  "Dining & Events",
  "Chef's Stories",
];

interface BlogFormProps {
  initialBlog?: Blog;
  isEdit?: boolean;
}

export default function BlogForm({ initialBlog, isEdit = false }: BlogFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [slugModified, setSlugModified] = useState(Boolean(initialBlog?.slug));
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || "");
  const [content, setContent] = useState(initialBlog?.content || "");
  const [coverImage, setCoverImage] = useState(
    initialBlog?.coverImage || "/images/behind-sukoon.png"
  );
  const [category, setCategory] = useState(
    initialBlog?.category || "Culinary Heritage"
  );
  const [customCategory, setCustomCategory] = useState("");
  const [tags, setTags] = useState<string[]>(
    initialBlog?.tags || ["Heritage", "Sukoon"]
  );
  const [tagInput, setTagInput] = useState("");
  const [authorName, setAuthorName] = useState(
    initialBlog?.author.name || "Sukoon Culinary Team"
  );
  const [authorRole, setAuthorRole] = useState(
    initialBlog?.author.role || "Executive Chef"
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initialBlog?.status || "published"
  );
  const [featured, setFeatured] = useState<boolean>(
    Boolean(initialBlog?.featured)
  );

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cover image states
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [coverMode, setCoverMode] = useState<"upload" | "presets" | "url">("upload");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [coverUploadSuccess, setCoverUploadSuccess] = useState<string | null>(null);

  // Inline content image states
  const [showImageModal, setShowImageModal] = useState(false);
  const [inlineTab, setInlineTab] = useState<"upload" | "gallery" | "url">("upload");
  const [inlineFile, setInlineFile] = useState<File | null>(null);
  const [inlineAlt, setInlineAlt] = useState("");
  const [inlineCustomUrl, setInlineCustomUrl] = useState("");
  const [uploadingInline, setUploadingInline] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic media library loaded from public folder
  const [mediaGallery, setMediaGallery] = useState<MediaFileItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "images" | "uploads">("all");

  const fetchMedia = async () => {
    try {
      setLoadingMedia(true);
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.images && Array.isArray(data.images)) {
        setMediaGallery(data.images);
      }
    } catch (err) {
      console.error("Failed to fetch public media library:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const filteredGallery = mediaGallery.filter((img) => {
    const matchesFilter =
      galleryFilter === "all" ||
      (galleryFilter === "images" && img.folder === "images") ||
      (galleryFilter === "uploads" && img.folder === "uploads");
    const matchesSearch =
      !gallerySearch.trim() ||
      img.name.toLowerCase().includes(gallerySearch.toLowerCase()) ||
      img.filename.toLowerCase().includes(gallerySearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const restaurantCount = mediaGallery.filter((i) => i.folder === "images").length;
  const uploadsCount = mediaGallery.filter((i) => i.folder === "uploads").length;

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploadError(null);
    setCoverUploadSuccess(null);

    if (file.size > 10 * 1024 * 1024) {
      setCoverUploadError("File size exceeds 10MB limit.");
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCoverUploadError(data.error || "Failed to upload image.");
        return;
      }

      setCoverImage(data.url);
      setCoverUploadSuccess("Image uploaded successfully!");
      fetchMedia();
    } catch {
      setCoverUploadError("Network error occurred during image upload.");
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = "";
      }
    }
  };

  const insertImageToContent = (url: string, alt: string) => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    const cleanAlt = alt.trim() || "Sukoon Story Image";
    const markdownImg = `\n\n![${cleanAlt}](${url})\n\n`;

    if (!textarea) {
      setContent((prev) => prev + markdownImg);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const nextContent = text.substring(0, start) + markdownImg + text.substring(end);
    setContent(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdownImg.length, start + markdownImg.length);
    }, 10);
  };

  const handleInlineUploadAndInsert = async () => {
    if (!inlineFile) {
      setInlineError("Please select an image file to upload.");
      return;
    }

    setInlineError(null);
    setUploadingInline(true);

    try {
      const formData = new FormData();
      formData.append("file", inlineFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setInlineError(data.error || "Failed to upload image.");
        setUploadingInline(false);
        return;
      }

      insertImageToContent(data.url, inlineAlt);
      fetchMedia();
      setShowImageModal(false);
      setInlineFile(null);
      setInlineAlt("");
      setInlineError(null);
    } catch {
      setInlineError("Network error during image upload.");
    } finally {
      setUploadingInline(false);
      if (inlineFileInputRef.current) {
        inlineFileInputRef.current.value = "";
      }
    }
  };

  const handleInlineUrlInsert = () => {
    if (!inlineCustomUrl.trim()) {
      setInlineError("Please provide an image URL.");
      return;
    }
    insertImageToContent(inlineCustomUrl.trim(), inlineAlt);
    setShowImageModal(false);
    setInlineCustomUrl("");
    setInlineAlt("");
    setInlineError(null);
  };

  const handleInlinePresetInsert = (presetUrl: string, presetLabel: string) => {
    insertImageToContent(presetUrl, inlineAlt || presetLabel);
    setShowImageModal(false);
    setInlineAlt("");
    setInlineError(null);
  };

  // Auto-generate slug when title changes unless user edited slug directly
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugModified && !isEdit) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugModified(true);
    setSlug(generateSlug(val));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, "");
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Insert markdown helper into textarea
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const nextContent =
      text.substring(0, start) + replacement + text.substring(end);

    setContent(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + replacement.length - suffix.length
      );
    }, 10);
  };

  const handleSubmit = async (overrideStatus?: "draft" | "published") => {
    setError(null);

    if (!title.trim()) {
      setError("Please provide an article title.");
      return;
    }

    if (!content.trim()) {
      setError("Please provide content for the article.");
      return;
    }

    const finalCategory =
      category === "custom" && customCategory.trim()
        ? customCategory.trim()
        : category;

    const finalStatus = overrideStatus || status;

    const payload: BlogFormData = {
      title,
      slug: slug.trim() || generateSlug(title),
      excerpt: excerpt.trim() || title.trim(),
      content,
      coverImage: coverImage.trim() || "/images/behind-sukoon.png",
      category: finalCategory,
      tags,
      author: {
        name: authorName.trim() || "Sukoon Team",
        role: authorRole.trim() || "Kitchen Operations",
        avatar: "/images/people.png",
      },
      status: finalStatus,
      featured,
      readTime: calculateReadTime(content),
    };

    setSaving(true);

    try {
      const url = isEdit ? `/api/blogs/${initialBlog?.id}` : "/api/blogs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save article.");
        setSaving(false);
        return;
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred while saving.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !initialBlog?.id ||
      !window.confirm(`Are you sure you want to delete "${initialBlog.title}"?`)
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${initialBlog.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/blogs");
        router.refresh();
      } else {
        alert("Failed to delete blog post.");
        setDeleting(false);
      }
    } catch {
      alert("Error deleting blog post.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDB789]/15">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="p-2 rounded-xl bg-[#141604] border border-[#DDB789]/20 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:border-[#DDB789] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-charman-serif-light text-[#F4EDE2]">
              {isEdit ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-xs text-[#F4EDE2]/60 mt-0.5">
              {isEdit
                ? `Updating: ${initialBlog?.title}`
                : "Draft a new culinary story or announcement"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={saving || deleting}
            className="px-4 py-2 rounded-full border border-[#DDB789]/30 text-xs text-[#F4EDE2] hover:border-[#DDB789] hover:text-[#DDB789] transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("published")}
            disabled={saving || deleting}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#DDB789] hover:bg-[#ebc99d] text-[#141604] font-semibold text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Publishing..." : isEdit ? "Update Article" : "Publish Now"}</span>
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              title="Delete Article"
              className="p-2 text-[#F4EDE2]/50 hover:text-red-400 hover:bg-red-950/40 rounded-full border border-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/70 border border-red-500/40 rounded-xl text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
          <span className="text-red-400 font-bold shrink-0">✕</span>
          <span>{error}</span>
        </div>
      )}

      {/* Editor & Preview Mode Switcher */}
      <div className="flex items-center gap-2 p-1 bg-[#141604] rounded-xl border border-[#DDB789]/15 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "edit"
              ? "bg-[#DDB789] text-[#141604] font-semibold"
              : "text-[#F4EDE2]/70 hover:text-white"
          }`}
        >
          <span>Editor Mode</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "preview"
              ? "bg-[#DDB789] text-[#141604] font-semibold"
              : "text-[#F4EDE2]/70 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Reader Preview</span>
        </button>
      </div>

      {activeTab === "edit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column (2 spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#DDB789] font-medium mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Philosophy of Sukoon: Why Food Should Comfort the Soul"
                  className="w-full px-4 py-3 bg-[#0c0d02] border border-[#DDB789]/25 rounded-xl text-[#F4EDE2] text-base font-medium placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F4EDE2]/50 font-medium mb-1">
                  URL Slug (Auto-generated)
                </label>
                <div className="flex items-center bg-[#0c0d02] border border-[#DDB789]/20 rounded-xl px-3 py-2 text-xs">
                  <span className="text-[#F4EDE2]/40 font-mono">/blogs/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="article-url-slug"
                    className="w-full bg-transparent text-[#DDB789] font-mono focus:outline-none ml-1"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs uppercase tracking-wider text-[#DDB789] font-medium">
                    Excerpt / Short Description *
                  </label>
                  <span className="text-[11px] text-[#F4EDE2]/40">
                    {excerpt.length} characters (120-180 recommended)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A brief summary that will appear on cards and search results..."
                  className="w-full px-4 py-2.5 bg-[#0c0d02] border border-[#DDB789]/25 rounded-xl text-xs text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789] leading-relaxed"
                />
              </div>
            </div>

            {/* Markdown Content Editor */}
            <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DDB789]/10">
                <label className="text-xs uppercase tracking-wider text-[#DDB789] font-medium">
                  Article Body (Markdown Supported) *
                </label>
                <span className="text-[11px] text-[#F4EDE2]/40">
                  {content.trim() ? content.trim().split(/\s+/).length : 0} words ·{" "}
                  {calculateReadTime(content)}
                </span>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0c0d02] rounded-xl border border-[#DDB789]/15">
                <button
                  type="button"
                  onClick={() => insertFormatting("## ", "")}
                  title="Heading 2"
                  className="p-1.5 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:bg-[#141604] rounded-lg transition-colors cursor-pointer"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  title="Bold"
                  className="p-1.5 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:bg-[#141604] rounded-lg transition-colors cursor-pointer"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*")}
                  title="Italic"
                  className="p-1.5 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:bg-[#141604] rounded-lg transition-colors cursor-pointer"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-4 bg-[#DDB789]/20 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("> ", "")}
                  title="Blockquote"
                  className="p-1.5 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:bg-[#141604] rounded-lg transition-colors cursor-pointer"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("- ", "")}
                  title="Bullet List"
                  className="p-1.5 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:bg-[#141604] rounded-lg transition-colors cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("1. ", "")}
                  title="Numbered List"
                  className="p-1.5 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:bg-[#141604] rounded-lg transition-colors cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n---\n", "")}
                  title="Horizontal Divider"
                  className="p-1.5 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:bg-[#141604] rounded-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("```\n", "\n```")}
                  title="Code / Callout"
                  className="p-1.5 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:bg-[#141604] rounded-lg transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-4 bg-[#DDB789]/20 mx-1" />
                <button
                  type="button"
                  onClick={() => setShowImageModal((prev) => !prev)}
                  title="Insert / Upload Image into Article"
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-medium ${
                    showImageModal
                      ? "bg-[#DDB789] text-[#141604]"
                      : "text-[#DDB789] hover:bg-[#141604] border border-[#DDB789]/30"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Insert Image</span>
                </button>
              </div>

              {/* Insert Image Panel */}
              {showImageModal && (
                <div className="p-4 bg-[#0e1003] border border-[#DDB789]/30 rounded-xl space-y-3.5 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DDB789]/15">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#DDB789]">
                      <ImageIcon className="w-4 h-4" />
                      <span>Insert Image into Article Body</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImageModal(false)}
                      className="p-1 text-[#F4EDE2]/50 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inline Tab Switcher */}
                  <div className="flex gap-1 p-1 bg-[#141604] rounded-lg border border-[#DDB789]/15 text-xs w-fit">
                    <button
                      type="button"
                      onClick={() => setInlineTab("upload")}
                      className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        inlineTab === "upload"
                          ? "bg-[#DDB789] text-[#141604]"
                          : "text-[#F4EDE2]/60 hover:text-white"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setInlineTab("gallery")}
                      className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        inlineTab === "gallery"
                          ? "bg-[#DDB789] text-[#141604]"
                          : "text-[#F4EDE2]/60 hover:text-white"
                      }`}
                    >
                      Sukoon Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setInlineTab("url")}
                      className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        inlineTab === "url"
                          ? "bg-[#DDB789] text-[#141604]"
                          : "text-[#F4EDE2]/60 hover:text-white"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {inlineError && (
                    <div className="p-2 bg-red-950/60 border border-red-500/30 rounded-lg text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{inlineError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-[#F4EDE2]/70 mb-1">
                      Image Caption / Alt Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={inlineAlt}
                      onChange={(e) => setInlineAlt(e.target.value)}
                      placeholder="e.g. Copper handi simmering on slow coals"
                      className="w-full px-3 py-2 bg-[#141604] border border-[#DDB789]/20 rounded-lg text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789]"
                    />
                  </div>

                  {inlineTab === "upload" && (
                    <div className="space-y-3">
                      <input
                        ref={inlineFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setInlineFile(f);
                            if (!inlineAlt) {
                              setInlineAlt(
                                f.name
                                  .replace(/\.[^/.]+$/, "")
                                  .replace(/[-_]/g, " ")
                              );
                            }
                          }
                        }}
                        className="w-full text-xs text-[#F4EDE2]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#DDB789] file:text-[#141604] hover:file:bg-[#e8c69b] file:cursor-pointer cursor-pointer"
                      />
                      {inlineFile && (
                        <div className="text-[11px] text-[#DDB789]">
                          Selected: {inlineFile.name} ({(inlineFile.size / 1024).toFixed(0)} KB)
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowImageModal(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#DDB789]/30 text-xs text-[#F4EDE2]/70 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleInlineUploadAndInsert}
                          disabled={!inlineFile || uploadingInline}
                          className="px-4 py-1.5 rounded-lg bg-[#DDB789] hover:bg-[#e8c69b] text-[#141604] text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {uploadingInline ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading &amp; Inserting...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload &amp; Insert Image</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {inlineTab === "gallery" && (
                    <div className="space-y-3">
                      {/* Search and filter toolbar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-[#F4EDE2]/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={gallerySearch}
                            onChange={(e) => setGallerySearch(e.target.value)}
                            placeholder="Filter public library by name or dish..."
                            className="w-full pl-8 pr-2.5 py-1.5 bg-[#141604] border border-[#DDB789]/20 rounded-lg text-xs text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setGalleryFilter("all")}
                            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                              galleryFilter === "all"
                                ? "bg-[#DDB789] text-[#141604]"
                                : "bg-[#141604] text-[#F4EDE2]/60 hover:text-white"
                            }`}
                          >
                            All ({mediaGallery.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalleryFilter("images")}
                            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                              galleryFilter === "images"
                                ? "bg-[#DDB789] text-[#141604]"
                                : "bg-[#141604] text-[#F4EDE2]/60 hover:text-white"
                            }`}
                          >
                            Photos ({restaurantCount})
                          </button>
                          {uploadsCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setGalleryFilter("uploads")}
                              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                                galleryFilter === "uploads"
                                  ? "bg-[#DDB789] text-[#141604]"
                                  : "bg-[#141604] text-[#F4EDE2]/60 hover:text-white"
                              }`}
                            >
                              Uploads ({uploadsCount})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={fetchMedia}
                            title="Refresh Media"
                            className="p-1 rounded-md border border-[#DDB789]/20 text-[#DDB789] hover:bg-[#141604] cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${loadingMedia ? "animate-spin" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Photo Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
                        {filteredGallery.length > 0 ? (
                          filteredGallery.map((img) => (
                            <button
                              key={img.url}
                              type="button"
                              onClick={() => handleInlinePresetInsert(img.url, img.name)}
                              className="relative rounded-lg overflow-hidden border border-[#DDB789]/20 hover:border-[#DDB789] aspect-video group cursor-pointer transition-all hover:scale-105 text-left"
                            >
                              <img
                                src={img.url}
                                alt={img.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1 pt-3">
                                <span className="block text-[8px] text-white font-medium truncate">
                                  {img.name}
                                </span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="col-span-full py-6 text-center text-xs text-[#F4EDE2]/50 italic">
                            {loadingMedia ? "Loading media files..." : "No photos matching filter."}
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-[#F4EDE2]/50 italic">
                        Click any of the {filteredGallery.length} public photos to insert it directly into the article body with its caption.
                      </p>
                    </div>
                  )}

                  {inlineTab === "url" && (
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={inlineCustomUrl}
                          onChange={(e) => setInlineCustomUrl(e.target.value)}
                          placeholder="https://example.com/photo.jpg or /images/..."
                          className="w-full px-3 py-2 bg-[#141604] border border-[#DDB789]/20 rounded-lg text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789] font-mono"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowImageModal(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#DDB789]/30 text-xs text-[#F4EDE2]/70 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleInlineUrlInsert}
                          disabled={!inlineCustomUrl.trim()}
                          className="px-4 py-1.5 rounded-lg bg-[#DDB789] hover:bg-[#e8c69b] text-[#141604] text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Insert from URL</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Textarea */}
              <textarea
                id="content-editor"
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article story here in markdown...&#10;&#10;## Subheading&#10;Paragraph describing the spices and cooking techniques...&#10;&#10;> An inspiring quote or culinary memory"
                className="w-full p-4 bg-[#0c0d02] border border-[#DDB789]/25 rounded-xl text-xs sm:text-sm text-[#F4EDE2] font-mono leading-relaxed placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
              />
            </div>
          </div>

          {/* Settings Sidebar Column (1 span) */}
          <div className="space-y-6">
            {/* Publishing Status Card */}
            <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 space-y-4">
              <div className="text-xs uppercase tracking-wider text-[#DDB789] font-medium">
                Publishing Controls
              </div>

              <div>
                <label className="block text-xs text-[#F4EDE2]/70 mb-2 font-medium">
                  Visibility Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("published")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      status === "published"
                        ? "bg-emerald-500 text-[#141604] shadow-md"
                        : "bg-[#0c0d02] border border-[#DDB789]/20 text-[#F4EDE2]/70 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      status === "draft"
                        ? "bg-amber-500 text-[#141604] shadow-md"
                        : "bg-[#0c0d02] border border-[#DDB789]/20 text-[#F4EDE2]/70 hover:text-white"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Draft</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DDB789]/10">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#F4EDE2]">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DDB789]/30 text-[#DDB789] accent-[#DDB789] bg-[#0c0d02]"
                  />
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#DDB789]" />
                    <span>Pin as Featured Article</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Category & Tags Card */}
            <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 space-y-4">
              <div className="text-xs uppercase tracking-wider text-[#DDB789] font-medium">
                Categorisation
              </div>

              <div>
                <label className="block text-xs text-[#F4EDE2]/70 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d02] border border-[#DDB789]/20 rounded-xl text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789] cursor-pointer"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom">+ Add Custom Category...</option>
                </select>

                {category === "custom" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="w-full mt-2 px-3 py-2 bg-[#0c0d02] border border-[#DDB789]/30 rounded-xl text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs text-[#F4EDE2]/70 mb-1.5">
                  Tags (Press Enter to add)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {tags.map((tag, i) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DDB789]/15 text-[#DDB789] text-[11px] font-medium"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(i)}
                        className="hover:text-red-400 text-xs ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="e.g. Spices, Tandoor..."
                  className="w-full px-3 py-2 bg-[#0c0d02] border border-[#DDB789]/20 rounded-xl text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789]"
                />
              </div>
            </div>

            {/* Cover Image Card */}
            <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-[#DDB789] font-medium flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Featured Cover Image</span>
                </div>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage("");
                      setCoverUploadSuccess(null);
                    }}
                    className="text-[11px] text-red-400/80 hover:text-red-300 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {coverImage ? (
                <div className="relative rounded-xl overflow-hidden border border-[#DDB789]/20 aspect-video bg-neutral-900 group">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#DDB789] text-[#141604] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Image</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => coverFileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-[#DDB789]/30 hover:border-[#DDB789] bg-[#0c0d02] aspect-video flex flex-col items-center justify-center p-4 cursor-pointer transition-colors text-center"
                >
                  <Upload className="w-6 h-6 text-[#DDB789] mb-2" />
                  <span className="text-xs text-[#F4EDE2] font-medium">Click to upload cover photo</span>
                  <span className="text-[10px] text-[#F4EDE2]/50 mt-1">PNG, JPG, WebP up to 10MB</span>
                </div>
              )}

              {/* Mode Switcher */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#0c0d02] rounded-xl border border-[#DDB789]/15 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCoverMode("upload")}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    coverMode === "upload"
                      ? "bg-[#DDB789] text-[#141604]"
                      : "text-[#F4EDE2]/60 hover:text-white"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode("presets")}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    coverMode === "presets"
                      ? "bg-[#DDB789] text-[#141604]"
                      : "text-[#F4EDE2]/60 hover:text-white"
                  }`}
                >
                  Sukoon Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode("url")}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    coverMode === "url"
                      ? "bg-[#DDB789] text-[#141604]"
                      : "text-[#F4EDE2]/60 hover:text-white"
                  }`}
                >
                  Custom URL
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                onChange={handleCoverFileUpload}
                className="hidden"
              />

              {coverMode === "upload" && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0c0d02] border border-[#DDB789]/30 hover:border-[#DDB789] text-xs text-[#F4EDE2] hover:text-[#DDB789] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {uploadingCover ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DDB789]" />
                        <span>Uploading Cover...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#DDB789]" />
                        <span>Select Image from Computer</span>
                      </>
                    )}
                  </button>

                  {coverUploadError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{coverUploadError}</span>
                    </p>
                  )}
                  {coverUploadSuccess && (
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{coverUploadSuccess}</span>
                    </p>
                  )}
                </div>
              )}

              {coverMode === "presets" && (
                <div className="space-y-3">
                  {/* Search and filters */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-[#F4EDE2]/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={gallerySearch}
                        onChange={(e) => setGallerySearch(e.target.value)}
                        placeholder="Search public photos..."
                        className="w-full pl-8 pr-2.5 py-1.5 bg-[#0c0d02] border border-[#DDB789]/20 rounded-lg text-xs text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={fetchMedia}
                      title="Reload public library"
                      className="p-1.5 rounded-lg border border-[#DDB789]/20 text-[#DDB789] hover:bg-[#141604] transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingMedia ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {/* Folder category filter pills */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setGalleryFilter("all")}
                      className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                        galleryFilter === "all"
                          ? "bg-[#DDB789] text-[#141604]"
                          : "bg-[#0c0d02] text-[#F4EDE2]/60 hover:text-white"
                      }`}
                    >
                      All ({mediaGallery.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryFilter("images")}
                      className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                        galleryFilter === "images"
                          ? "bg-[#DDB789] text-[#141604]"
                          : "bg-[#0c0d02] text-[#F4EDE2]/60 hover:text-white"
                      }`}
                    >
                      Restaurant ({restaurantCount})
                    </button>
                    {uploadsCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setGalleryFilter("uploads")}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                          galleryFilter === "uploads"
                            ? "bg-[#DDB789] text-[#141604]"
                            : "bg-[#0c0d02] text-[#F4EDE2]/60 hover:text-white"
                        }`}
                      >
                        Uploads ({uploadsCount})
                      </button>
                    )}
                  </div>

                  {/* Image Grid with scroll */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {filteredGallery.length > 0 ? (
                      filteredGallery.map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => {
                            setCoverImage(img.url);
                            setCoverUploadSuccess(null);
                          }}
                          className={`relative rounded-lg overflow-hidden border aspect-video cursor-pointer transition-all text-left group ${
                            coverImage === img.url
                              ? "border-[#DDB789] ring-2 ring-[#DDB789]/60 shadow-lg scale-[1.02]"
                              : "border-[#DDB789]/15 hover:border-[#DDB789]/60 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5 pt-4">
                            <span className="block text-[9px] text-[#F4EDE2] font-medium truncate">
                              {img.name}
                            </span>
                            <span className="text-[8px] text-[#DDB789]/75 font-mono">
                              {img.formattedSize}
                            </span>
                          </div>
                          {coverImage === img.url && (
                            <span className="absolute top-1 right-1 bg-[#DDB789] text-[#141604] p-0.5 rounded-full shadow">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-3 py-8 text-center text-xs text-[#F4EDE2]/50 italic">
                        {loadingMedia ? "Loading media files..." : "No photos matching your search."}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#F4EDE2]/40 italic">
                    Showing {filteredGallery.length} of {mediaGallery.length} public images. Click any photo to set as cover.
                  </p>
                </div>
              )}

              {coverMode === "url" && (
                <div>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="/images/hero-image.png or https://..."
                    className="w-full px-3 py-2 bg-[#0c0d02] border border-[#DDB789]/20 rounded-xl text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789] font-mono"
                  />
                </div>
              )}
            </div>

            {/* Author Attribution Card */}
            <div className="p-5 rounded-2xl bg-[#141604] border border-[#DDB789]/15 space-y-3">
              <div className="text-xs uppercase tracking-wider text-[#DDB789] font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Author Attribution</span>
              </div>

              <div>
                <label className="block text-xs text-[#F4EDE2]/70 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Sukoon Culinary Team"
                  className="w-full px-3 py-2 bg-[#0c0d02] border border-[#DDB789]/20 rounded-xl text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#F4EDE2]/70 mb-1">
                  Author Role / Title
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="Executive Chef & Founders"
                  className="w-full px-3 py-2 bg-[#0c0d02] border border-[#DDB789]/20 rounded-xl text-xs text-[#F4EDE2] focus:outline-none focus:border-[#DDB789]"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIVE PREVIEW TAB */
        <div className="bg-[#141604] border border-[#DDB789]/20 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 w-full max-w-6xl mx-auto">
          <div className="border-b border-[#DDB789]/15 pb-6">
            <div className="flex items-center gap-3 text-xs text-[#DDB789] font-medium mb-3">
              <span className="px-3 py-1 rounded-full bg-[#DDB789]/15 border border-[#DDB789]/20 uppercase tracking-widest text-[11px]">
                {category}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#F4EDE2]/60">
                <Clock className="w-3.5 h-3.5" />
                <span>{calculateReadTime(content)}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#F4EDE2]/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>Today (Preview)</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-charman-serif-light text-[#F4EDE2] leading-tight">
              {title || "Untitled Article"}
            </h1>

            {excerpt && (
              <p className="mt-4 text-base sm:text-lg text-[#F4EDE2]/80 leading-relaxed font-instrument-regular italic">
                {excerpt}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3 pt-6 border-t border-[#DDB789]/10">
              <div className="w-10 h-10 rounded-full bg-[#DDB789]/20 border border-[#DDB789]/40 flex items-center justify-center text-[#DDB789] font-bold text-sm">
                {authorName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-[#F4EDE2]">{authorName}</div>
                <div className="text-xs text-[#DDB789]">{authorRole}</div>
              </div>
            </div>
          </div>

          {/* Cover image preview */}
          {coverImage && (
            <div className="rounded-2xl overflow-hidden border border-[#DDB789]/20 shadow-xl max-h-[480px]">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rendered Content preview */}
          <div className="prose prose-invert max-w-none text-[#F4EDE2]/90 leading-relaxed space-y-4 font-instrument-regular text-sm sm:text-base">
            {content.split(/\n\n+/).map((para, idx) => {
              const trimmed = para.trim();
              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={idx}
                    className="text-2xl sm:text-3xl font-charman-serif-light text-[#DDB789] pt-6 pb-2 border-b border-[#DDB789]/15"
                  >
                    {trimmed.replace(/^## /, "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("### ")) {
                return (
                  <h3
                    key={idx}
                    className="text-xl font-charman-serif-light text-[#F4EDE2] pt-4"
                  >
                    {trimmed.replace(/^### /, "")}
                  </h3>
                );
              }

              // Image block: ![alt](url)
              const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
              if (imgMatch) {
                const [, alt, src] = imgMatch;
                return (
                  <figure key={idx} className="my-6 space-y-2">
                    <div className="rounded-2xl overflow-hidden border border-[#DDB789]/20 shadow-xl bg-[#0c0d02]">
                      <img
                        src={src}
                        alt={alt || "Article illustration"}
                        className="w-full h-auto object-cover max-h-[500px]"
                      />
                    </div>
                    {alt && (
                      <figcaption className="text-center text-xs text-[#DDB789]/75 italic pt-1">
                        — {alt}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote
                    key={idx}
                    className="p-4 my-4 border-l-2 border-[#DDB789] bg-[#0c0d02]/60 rounded-r-xl italic text-[#DDB789] text-base"
                  >
                    {trimmed.replace(/^> /, "")}
                  </blockquote>
                );
              }
              if (trimmed === "---") {
                return <hr key={idx} className="my-6 border-[#DDB789]/20" />;
              }

              // Bullet list
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const items = trimmed.split("\n").filter((l) => l.trim().length > 0);
                return (
                  <ul key={idx} className="my-4 space-y-2 pl-2">
                    {items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DDB789] mt-2 shrink-0" />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item
                              .replace(/^[-*]\s+/, "")
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#F4EDE2]">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em class="italic text-[#DDB789]">$1</em>'),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={idx}
                  className="leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: trimmed
                      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-xl border border-[#DDB789]/20 w-full max-h-[450px] object-cover" />')
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#DDB789] underline underline-offset-4" target="_blank" rel="noopener noreferrer">$1</a>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#F4EDE2]">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="italic text-[#DDB789]">$1</em>')
                      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#0c0d02] text-[#DDB789] font-mono text-xs border border-[#DDB789]/20">$1</code>'),
                  }}
                />
              );
            })}
          </div>

          {/* Tags preview */}
          {tags.length > 0 && (
            <div className="pt-6 border-t border-[#DDB789]/15 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#F4EDE2]/50 uppercase tracking-wider">
                Tags:
              </span>
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-[#DDB789]/10 text-[#DDB789] text-xs font-medium border border-[#DDB789]/20"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
