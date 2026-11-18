import { Metadata } from "next";
import HeroSection from "../about/components/HeroSection";
import SlowDown from "../home/components/SlowDown";
import BlogsExplorer from "./components/BlogsExplorer";
import { getAllBlogs, getBlogCategories } from "@/lib/blog-service";

export const metadata: Metadata = {
  title: "Chronicles of Sukoon | Food, Stories & Heritage",
  description:
    "Explore essays on Indian culinary heritage, the poetry of spices, and behind-the-scenes glimpses into Sukoon Indian Restaurant in Melbourne.",
};

export default async function BlogsPage() {
  const [blogs, rawCategories] = await Promise.all([
    getAllBlogs({ status: "published" }),
    getBlogCategories(),
  ]);

  const categories = ["All", ...rawCategories];

  return (
    <div className="bg-[#1d2002] text-[#F4EDE2]">
      {/* Hero Banner */}
      <HeroSection
        title="Chronicles"
        secondTitle="of Sukoon"
        subTitle="Essays on ancient culinary heritage, the alchemy of slow spices, and reflections from our hearth on Swan Street."
        image="/images/hero-image.png"
      />

      {/* Main Exploration Section */}
      <section className="px-7.5 sm:px-13 container-px py-16 sm:py-24 max-w-[1920px] mx-auto">
        <div className="mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#DDB789] font-medium font-instrument-regular">
            The Journal & Stories
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-charman-serif-light text-[#F4EDE2]">
            Tales from the Hearth
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#F4EDE2]/70 font-instrument-regular max-w-2xl leading-relaxed">
            Every dish we prepare carries centuries of memory. We invite you to explore the recipes, spices, and quiet philosophy that guide our kitchen.
          </p>
        </div>

        <BlogsExplorer initialBlogs={blogs} categories={categories} />
      </section>

      {/* Brand CTA */}
      <SlowDown />
    </div>
  );
}
