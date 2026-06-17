'use client';

import { Tag, TAG_STYLES } from '../lib/tags';

interface TagBadgeProps {
  tag: string;
}

export function TagBadge({ tag }: TagBadgeProps) {
  const style =
    tag in TAG_STYLES
      ? TAG_STYLES[tag as Tag]
      : 'bg-zinc-100 text-zinc-700';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {tag}
    </span>
  );
}
