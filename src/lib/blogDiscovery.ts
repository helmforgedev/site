import type { CollectionEntry } from 'astro:content';
import { BLOG_CATEGORY_DETAILS, slugifyBlogTag, type BlogCategorySlug } from '../data/blog';
import { getPublishedDate } from './blogFeed';

export type BlogPost = CollectionEntry<'blog'>;

export function getBlogPostUrl(post: BlogPost) {
  return `/blog/${post.id}`;
}

export function getCategoryUrl(category: BlogCategorySlug) {
  return `/blog/category/${category}`;
}

export function getTagUrl(tag: string) {
  return `/blog/tag/${slugifyBlogTag(tag)}`;
}

export function getSortedPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => getPublishedDate(b).valueOf() - getPublishedDate(a).valueOf());
}

export function getAllTags(posts: BlogPost[]) {
  const tagMap = new Map<string, { tag: string; slug: string; count: number }>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugifyBlogTag(tag);
      const existing = tagMap.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        tagMap.set(slug, { tag, slug, count: 1 });
      }
    }
  }

  return [...tagMap.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByCategory(posts: BlogPost[], category: BlogCategorySlug) {
  return getSortedPosts(posts).filter((post) => post.data.category === category);
}

export function getPostsByTag(posts: BlogPost[], tagSlug: string) {
  return getSortedPosts(posts).filter((post) => post.data.tags.some((tag) => slugifyBlogTag(tag) === tagSlug));
}

export function getCategoryCounts(posts: BlogPost[]) {
  return Object.fromEntries(
    Object.keys(BLOG_CATEGORY_DETAILS).map((category) => [
      category,
      posts.filter((post) => post.data.category === category).length,
    ]),
  ) as Record<BlogCategorySlug, number>;
}

export function getRelatedPosts(currentPost: BlogPost, posts: BlogPost[], limit = 3) {
  const currentTags = new Set(currentPost.data.tags.map(slugifyBlogTag));
  const currentCharts = new Set(currentPost.data.relatedCharts);

  return posts
    .filter((post) => post.id !== currentPost.id)
    .map((post) => {
      const sharedTags = post.data.tags.filter((tag) => currentTags.has(slugifyBlogTag(tag))).length;
      const sharedCharts = post.data.relatedCharts.filter((chart) => currentCharts.has(chart)).length;
      const categoryScore = post.data.category === currentPost.data.category ? 4 : 0;
      const score = categoryScore + sharedTags * 2 + sharedCharts * 3;
      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || getPublishedDate(b.post).valueOf() - getPublishedDate(a.post).valueOf())
    .slice(0, limit)
    .map(({ post }) => post);
}

export function getLatestPosts(posts: BlogPost[], currentPost?: BlogPost, limit = 3) {
  return getSortedPosts(posts)
    .filter((post) => post.id !== currentPost?.id)
    .slice(0, limit);
}

export function getAdjacentPosts(currentPost: BlogPost, posts: BlogPost[]) {
  const sorted = getSortedPosts(posts);
  const index = sorted.findIndex((post) => post.id === currentPost.id);

  return {
    newerPost: index > 0 ? sorted[index - 1] : undefined,
    olderPost: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}
