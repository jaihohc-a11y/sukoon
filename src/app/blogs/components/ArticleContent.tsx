import React from "react";

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  // Parse paragraphs and markdown blocks
  const blocks = content.split(/\n\n+/);

  return (
    <div className="article-body space-y-7 text-[#F4EDE2]/90 text-base md:text-[18px] 2xl:text-[20px] leading-7 md:leading-8 font-instrument-regular">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-2xl sm:text-3xl md:text-4xl 2xl:text-[44px] font-charman-serif-light text-[#DDB789] pt-10 pb-4 border-b border-[#DDB789]/20 leading-tight"
            >
              {trimmed.replace(/^## /, "")}
            </h2>
          );
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="text-xl sm:text-2xl md:text-3xl font-charman-serif-light text-[#F4EDE2] pt-8 pb-2 leading-snug"
            >
              {trimmed.replace(/^### /, "")}
            </h3>
          );
        }

        // Markdown Image: ![alt](url)
        const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imageMatch) {
          const [, alt, src] = imageMatch;
          return (
            <figure key={idx} className="my-8 sm:my-10 space-y-3">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#DDB789]/25 shadow-2xl bg-[#0f1102]">
                <img
                  src={src}
                  alt={alt || "Sukoon Chronicle Illustration"}
                  className="w-full h-auto object-cover max-h-[640px]"
                  loading="lazy"
                />
              </div>
              {alt && (
                <figcaption className="text-center text-xs sm:text-sm text-[#DDB789]/75 italic font-instrument-regular pt-1">
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
              className="my-8 p-6 sm:p-8 border-l-4 border-[#DDB789] bg-[#161803]/90 rounded-r-2xl text-[#DDB789] font-charman-serif-light text-xl sm:text-2xl md:text-[28px] italic leading-relaxed shadow-lg"
            >
              &ldquo;{trimmed.replace(/^> /, "").replace(/^["“]|["”]$/g, "")}&rdquo;
            </blockquote>
          );
        }

        if (trimmed === "---") {
          return (
            <div key={idx} className="my-10 flex items-center justify-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DDB789]/30 to-transparent" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#DDB789]/60 rotate-45" />
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DDB789]/30 to-transparent" />
            </div>
          );
        }

        if (trimmed.startsWith("```")) {
          const lines = trimmed.split("\n");
          const codeLines = lines.slice(1, lines[lines.length - 1].startsWith("```") ? -1 : undefined);
          return (
            <div
              key={idx}
              className="my-6 p-6 rounded-2xl bg-[#0f1102] border border-[#DDB789]/20 text-[#DDB789] font-mono text-sm sm:text-base overflow-x-auto shadow-inner"
            >
              <pre>{codeLines.join("\n")}</pre>
            </div>
          );
        }

        // Bullet list
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter((l) => l.trim().length > 0);
          return (
            <ul key={idx} className="my-6 space-y-3 pl-2">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3.5">
                  <span className="w-2 h-2 rounded-full bg-[#DDB789] mt-3 shrink-0" />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatInlineMarkdown(item.replace(/^[-*]\s+/, "")),
                    }}
                  />
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").filter((l) => l.trim().length > 0);
          return (
            <ol key={idx} className="my-6 space-y-3.5 pl-2">
              {items.map((item, itemIdx) => {
                const match = item.match(/^(\d+)\.\s+(.*)$/);
                const num = match ? match[1] : itemIdx + 1;
                const text = match ? match[2] : item;
                return (
                  <li key={itemIdx} className="flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-full bg-[#DDB789]/15 border border-[#DDB789]/30 text-[#DDB789] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {num}
                    </span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: formatInlineMarkdown(text),
                      }}
                    />
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard paragraph
        return (
          <p
            key={idx}
            className="leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: formatInlineMarkdown(trimmed),
            }}
          />
        );
      })}
    </div>
  );
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-6 rounded-2xl border border-[#DDB789]/20 w-full max-h-[500px] object-cover shadow-lg" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#DDB789] underline underline-offset-4 hover:text-[#f4ede2] transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#F4EDE2]">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-[#DDB789]">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-2 py-0.5 rounded bg-[#0f1102] text-[#DDB789] font-mono text-sm border border-[#DDB789]/20">$1</code>');
}
