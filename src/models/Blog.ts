import mongoose, { Schema, Model, Document } from "mongoose";

export interface IBlog extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    role?: string;
    avatar?: string;
  };
  status: "draft" | "published";
  featured: boolean;
  readTime: string;
  publishedAt: Date;
  updatedAt: Date;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

const BlogSchema = new Schema<IBlog>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: "/images/behind-sukoon.png",
    },
    category: {
      type: String,
      required: true,
      default: "Culinary Heritage",
      index: true,
    },
    tags: {
      type: [String],
      default: ["Heritage", "Sukoon"],
    },
    author: {
      name: {
        type: String,
        default: "Sukoon Culinary Team",
      },
      role: {
        type: String,
        default: "Executive Chef",
      },
      avatar: {
        type: String,
        default: "/images/people.png",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    readTime: {
      type: String,
      default: "4 min read",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  {
    timestamps: true,
    collection: "blogs",
  }
);

export const BlogModel: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
