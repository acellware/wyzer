import { getCollection, type CollectionEntry } from 'astro:content';

export type Framework = CollectionEntry<'frameworks'>;
export type Topic = CollectionEntry<'topics'>;

/** Map of framework slug -> entry (e.g. "nist" -> {...}). */
export async function getFrameworkMap(): Promise<Map<string, Framework>> {
  const list = await getCollection('frameworks');
  return new Map(list.map((f) => [f.id, f]));
}

/** Frameworks in display order. */
export async function getFrameworksOrdered(): Promise<Framework[]> {
  const list = await getCollection('frameworks');
  return list.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

/** Map of topic slug -> entry. */
export async function getTopicMap(): Promise<Map<string, Topic>> {
  const list = await getCollection('topics');
  return new Map(list.map((t) => [t.slug, t]));
}

/**
 * Build-time guard: resolve a topic slug referenced by a nav node.
 * Throws (fails the build) if the slug is unknown, our reference integrity check.
 */
export function requireTopic(map: Map<string, Topic>, slug: string, where: string): Topic {
  const topic = map.get(slug);
  if (!topic) {
    throw new Error(`[content] Unknown topic "${slug}" referenced by ${where}. Add src/content/topics/${slug}.mdx or fix the reference.`);
  }
  return topic;
}

export interface Crumb {
  label: string;
  href?: string;
}
