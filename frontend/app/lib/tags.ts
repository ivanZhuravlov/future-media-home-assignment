export const TAGS = [
  'General',
  'Tech',
  'Random',
  'Announcement',
  'Question',
] as const;

export type Tag = (typeof TAGS)[number];

export const TAG_STYLES: Record<Tag, string> = {
  General: 'bg-zinc-100 text-zinc-700',
  Tech: 'bg-blue-100 text-blue-800',
  Random: 'bg-purple-100 text-purple-800',
  Announcement: 'bg-amber-100 text-amber-800',
  Question: 'bg-emerald-100 text-emerald-800',
};
