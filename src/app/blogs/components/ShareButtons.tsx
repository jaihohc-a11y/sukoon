"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

export default function ShareButtons({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareTwitter = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`"${title}" from Sukoon Indian Restaurant:`);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
    }
  };

  const shareFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  const shareLinkedIn = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-[#F4EDE2]/50 font-medium mr-1 flex items-center gap-1.5">
        <Share2 className="w-3.5 h-3.5 text-[#DDB789]" />
        <span className="hidden sm:inline">Share Story:</span>
      </span>

      <button
        type="button"
        onClick={handleCopy}
        title="Copy article link"
        className="px-3 py-1.5 rounded-full border border-[#DDB789]/30 text-xs text-[#F4EDE2]/80 hover:border-[#DDB789] hover:text-[#DDB789] transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Link Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={shareTwitter}
        title="Share on X"
        className="p-2 rounded-full border border-[#DDB789]/30 text-xs text-[#F4EDE2]/80 hover:border-[#DDB789] hover:text-[#DDB789] transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={shareFacebook}
        title="Share on Facebook"
        className="p-2 rounded-full border border-[#DDB789]/30 text-xs text-[#F4EDE2]/80 hover:border-[#DDB789] hover:text-[#DDB789] transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.771 0-1.603.208-1.921.619-.344.444-.39 1.141-.39 2.128v1.238h4.298l-.586 3.667h-3.712v7.98c5.845-.989 10.276-6.074 10.276-12.191 0-6.903-5.597-12.5-12.5-12.5S0 4.597 0 11.5c0 6.117 4.431 11.202 10.276 12.191" />
        </svg>
      </button>

      <button
        type="button"
        onClick={shareLinkedIn}
        title="Share on LinkedIn"
        className="p-2 rounded-full border border-[#DDB789]/30 text-xs text-[#F4EDE2]/80 hover:border-[#DDB789] hover:text-[#DDB789] transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      </button>
    </div>
  );
}
