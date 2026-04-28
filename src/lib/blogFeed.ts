import { statSync } from 'node:fs';
import path from 'node:path';
import type { CollectionEntry } from 'astro:content';
import type { RSSFeedItem } from '@astrojs/rss';
import { AUTHORS, DEFAULT_AUTHOR_ID } from '../data/authors';

type BlogPost = CollectionEntry<'blog'>;

const BLOG_IMAGE_WIDTH = 1600;
const BLOG_IMAGE_HEIGHT = 900;

export function getPublishedDate(post: BlogPost) {
  return post.data.publishDate ?? post.data.date;
}

export function getModifiedDate(post: BlogPost) {
  return post.data.updatedAt ?? getPublishedDate(post);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPublicAssetSize(publicPath: string) {
  return statSync(path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''))).size;
}

export function getSortedBlogPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => getPublishedDate(b).valueOf() - getPublishedDate(a).valueOf());
}

export function getBlogRssItems(posts: BlogPost[], site: URL): RSSFeedItem[] {
  return getSortedBlogPosts(posts).map((post) => {
    const author = AUTHORS[post.data.authorId] ?? AUTHORS[DEFAULT_AUTHOR_ID];
    const canonicalUrl = new URL(`/blog/${post.id}`, site).toString();
    const imageUrl = new URL(post.data.coverImage, site).toString();

    return {
      title: post.data.title,
      description: post.data.description,
      link: canonicalUrl,
      pubDate: getPublishedDate(post),
      categories: post.data.tags,
      author: author.name,
      enclosure: {
        url: imageUrl,
        length: getPublicAssetSize(post.data.coverImage),
        type: 'image/webp',
      },
      customData:
        `<dc:creator>${escapeXml(author.name)}</dc:creator>` +
        `<media:content url="${escapeXml(imageUrl)}" medium="image" type="image/webp" width="${BLOG_IMAGE_WIDTH}" height="${BLOG_IMAGE_HEIGHT}" />` +
        `<media:thumbnail url="${escapeXml(imageUrl)}" width="${BLOG_IMAGE_WIDTH}" height="${BLOG_IMAGE_HEIGHT}" />` +
        `<guid isPermaLink="true">${escapeXml(canonicalUrl)}</guid>`,
    };
  });
}
