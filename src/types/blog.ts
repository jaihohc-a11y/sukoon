export interface BlogAuthor {
  name: string;
  role?: string;
  avatar?: string;
}

export type BlogStatus = "draft" | "published";

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: BlogAuthor;
  status: BlogStatus;
  featured?: boolean;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface BlogFormData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: BlogAuthor;
  status: BlogStatus;
  featured?: boolean;
  readTime?: string;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  categories: { name: string; count: number }[];
}
