import { notFound } from "next/navigation";
import { getBlogById, getBlogBySlug } from "@/lib/blog-service";
import BlogForm from "../../../components/BlogForm";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let blog = await getBlogById(id);
  if (!blog) {
    blog = await getBlogBySlug(id);
  }

  if (!blog) {
    notFound();
  }

  return <BlogForm initialBlog={blog} isEdit={true} />;
}
