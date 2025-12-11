export type CmsPost = {
  id: string;
  title: string;
  slug: string;
  category?: string;
  summary?: string;
  publishedAt?: string;
  heroImage?: {
    url?: string;
    alt?: string;
  };
  content?: any;
};

const baseUrl = import.meta.env.VITE_PAYLOAD_PUBLIC_URL || '';
const apiRoot = `${baseUrl}/api`;

const mapPost = (post: any): CmsPost => ({
  id: post.id ?? post._id ?? post.slug,
  title: post.title,
  slug: post.slug,
  category: post.category,
  summary: post.summary,
  publishedAt: post.publishedAt,
  heroImage: post.heroImage?.url
    ? { url: post.heroImage.url, alt: post.heroImage.alt }
    : post.heroImage?.filename
      ? { url: `${baseUrl}/media/${post.heroImage.filename}`, alt: post.heroImage.alt }
      : undefined,
  content: post.content,
});

export const fetchPublishedPosts = async (): Promise<CmsPost[]> => {
  const url = `${apiRoot}/posts?where[status][equals]=published&sort=-publishedAt`;
  const res = await fetch(url);

  if (!res.ok) throw new Error('Failed to load posts');
  const data = await res.json();
  return Array.isArray(data?.docs) ? data.docs.map(mapPost) : [];
};

export const fetchPostBySlug = async (slug: string): Promise<CmsPost | null> => {
  const url = `${apiRoot}/posts?where[slug][equals]=${slug}&limit=1&depth=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load post');
  const data = await res.json();
  const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
  return doc ? mapPost(doc) : null;
};
