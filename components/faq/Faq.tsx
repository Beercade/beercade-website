import { Fragment } from "react";

export interface FaqItem {
  q: string;
  /**
   * Answer copy as plain text. Inline tokens are rendered specially:
   *  - `[bracketed]`  → muted "to confirm before launch" span (a real-world
   *    fact the consultant fills in before go-live; mirrors the Footer FILLME
   *    convention).
   *  - `**bold**`     → <strong>.
   *  - email address  → mailto link.
   */
  a: string;
}

/** Tokenise an answer into bracket-TODOs, bold runs, emails, and plain text. */
function renderAnswer(text: string) {
  // Bracket alternative allows one level of nesting, e.g. "[Or call [phone].]".
  const token =
    /(\[(?:[^[\]]|\[[^[\]]*\])*\]|\*\*[^*]+\*\*|[\w.+-]+@[\w.-]+\.[\w-]+)/g;
  const parts = text.split(token);

  return parts.map((part, i) => {
    if (!part) return null;

    // Real-world fact the consultant must confirm before launch.
    if (part.startsWith("[") && part.endsWith("]")) {
      return (
        <span
          key={i}
          title="To confirm before launch"
          className="text-crema/40"
        >
          {part}
        </span>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-crema">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/^[\w.+-]+@[\w.-]+\.[\w-]+$/.test(part)) {
      return (
        <a
          key={i}
          href={`mailto:${part}`}
          className="text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange"
        >
          {part}
        </a>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * A run of FAQ entries rendered as native disclosure widgets — no JS, keyboard
 * accessible, and zero layout shift. Each question is an Archivo Bold sub-head;
 * the answer sits in a measure-width column underneath.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-hairline">
      {items.map((item) => (
        <details
          key={item.q}
          className="group border-b border-hairline"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema [&::-webkit-details-marker]:hidden">
            <span className="t-h3">{item.q}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              aria-hidden="true"
              className="shrink-0 text-high-score-orange transition-transform duration-200 group-open:rotate-45"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </summary>
          <p className="max-w-prose pb-7 font-body leading-relaxed text-crema/70">
            {renderAnswer(item.a)}
          </p>
        </details>
      ))}
    </div>
  );
}
