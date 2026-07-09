import type { ReactNode } from "react";
import { getWikiLinkUrl } from "@/lib/walda/wiki-links";

const WIKI_PATTERN = /\[\[([^\]]+)\]\]/g;

export function parseWikiText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(WIKI_PATTERN);
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const term = match[1];
    const url = getWikiLinkUrl(term);

    if (url) {
      parts.push(
        <a
          key={`${term}-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
        >
          {term}
        </a>,
      );
    } else {
      parts.push(
        <span
          key={`${term}-${match.index}`}
          className="font-medium text-primary"
        >
          {term}
        </span>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
