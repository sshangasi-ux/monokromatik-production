// MonoKromatik RSS Story Fetcher
// Fetches stories from RSS feeds with full media support (images, videos, content)

import Parser from 'rss-parser';
import { RSS_FEEDS, RSSFeed, Story } from './rss-feeds';

// Extended parser to handle media elements
interface CustomFeed {
  'media:content'?: { $: { url: string; type?: string } }[];
  'media:thumbnail'?: { $: { url: string } }[];
}

interface CustomItem {
  'media:content'?: any;
  'media:thumbnail'?: any;
  'content:encoded'?: string;
  'content'?: string;
  contentSnippet?: string;
  enclosure?: { url: string; type?: string };
}

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
      ['enclosure', 'enclosure'],
    ],
  },
});

/**
 * Extract image URL from RSS item (tries multiple sources)
 */
function extractImageUrl(item: CustomItem): string | undefined {
  // 1. Try media:content (common in modern RSS)
  if (item['media:content']) {
    const mediaContent = Array.isArray(item['media:content']) 
      ? item['media:content'][0] 
      : item['media:content'];
    
    if (mediaContent?.$?.url && mediaContent?.$?.type?.includes('image')) {
      return mediaContent.$.url;
    }
  }

  // 2. Try media:thumbnail
  if (item['media:thumbnail']) {
    const mediaThumbnail = Array.isArray(item['media:thumbnail']) 
      ? item['media:thumbnail'][0] 
      : item['media:thumbnail'];
    
    if (mediaThumbnail?.$?.url) {
      return mediaThumbnail.$.url;
    }
  }

  // 3. Try enclosure (podcast/media files)
  if (item.enclosure?.url && item.enclosure?.type?.includes('image')) {
    return item.enclosure.url;
  }

  // 4. Try to extract from content (look for <img> tags)
  const content = item['content:encoded'] || item.content || item.contentSnippet || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Extract video URL from RSS item
 */
function extractVideoUrl(item: CustomItem): string | undefined {
  // 1. Try media:content with video type
  if (item['media:content']) {
    const mediaContent = Array.isArray(item['media:content']) 
      ? item['media:content'][0] 
      : item['media:content'];
    
    if (mediaContent?.$?.url && mediaContent?.$?.type?.includes('video')) {
      return mediaContent.$.url;
    }
  }

  // 2. Try enclosure with video type
  if (item.enclosure?.url && item.enclosure?.type?.includes('video')) {
    return item.enclosure.url;
  }

  // 3. Look for YouTube/Vimeo embeds in content
  const content = item['content:encoded'] || item.content || '';
  
  // YouTube
  const youtubeMatch = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/watch?v=${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = content.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://vimeo.com/${vimeoMatch[1]}`;
  }

  return undefined;
}

/**
 * Extract full content from RSS item (prefer HTML content over snippet)
 */
function extractContent(item: CustomItem): string {
  // Priority: content:encoded > content > contentSnippet
  return item['content:encoded'] || item.content || item.contentSnippet || '';
}

/**
 * Create excerpt from content (first 200 chars)
 */
function createExcerpt(content: string): string {
  // Strip HTML tags
  const stripped = content.replace(/<[^>]+>/g, '');
  // Get first 200 characters
  const excerpt = stripped.substring(0, 200).trim();
  // Add ellipsis if truncated
  return excerpt.length < stripped.length ? `${excerpt}...` : excerpt;
}

/**
 * Determine media type from story
 */
function determineMediaType(story: Story): 'image' | 'video' | 'text' {
  if (story.videoUrl) return 'video';
  if (story.imageUrl) return 'image';
  return 'text';
}

/**
 * Fetch stories from a single RSS feed
 */
async function fetchFromFeed(feed: RSSFeed): Promise<Story[]> {
  try {
    const parsed = await parser.parseURL(feed.url);
    
    const stories: Story[] = parsed.items.map(item => {
      const content = extractContent(item);
      const imageUrl = extractImageUrl(item);
      const videoUrl = extractVideoUrl(item);
      
      const story: Story = {
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.name,
        category: feed.category,
        content,
        excerpt: item.contentSnippet || createExcerpt(content),
        author: item.creator || item.author,
        imageUrl,
        videoUrl,
        guid: item.guid || item.link,
        tags: item.categories || [],
      };

      story.mediaType = determineMediaType(story);

      return story;
    });

    return stories;
  } catch (error) {
    console.error(`❌ Error fetching ${feed.name}:`, error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

/**
 * Fetch stories from all RSS feeds
 */
export async function fetchStories(feeds: RSSFeed[] = RSS_FEEDS): Promise<Story[]> {
  console.log(`\n📡 Fetching stories from ${feeds.length} feeds...\n`);
  
  const allStories: Story[] = [];
  
  for (const feed of feeds) {
    console.log(`   Fetching: ${feed.name}...`);
    const stories = await fetchFromFeed(feed);
    allStories.push(...stories);
    console.log(`   ✅ Got ${stories.length} stories from ${feed.name}`);
    
    // Rate limiting (be nice to servers)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Sort by publish date (newest first)
  allStories.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  
  console.log(`\n✅ Total stories fetched: ${allStories.length}\n`);
  
  return allStories;
}

/**
 * Fetch only culture, sports, and entertainment stories (MonoKromatik focus)
 */
export async function fetchMonoKromatikStories(): Promise<Story[]> {
  const monoFeeds = RSS_FEEDS.filter(feed => 
    feed.category === 'culture' || 
    feed.category === 'sports' || 
    feed.category === 'entertainment' ||
    feed.category === 'music'
  );
  
  return fetchStories(monoFeeds);
}

/**
 * Get media statistics from stories
 */
export function getMediaStats(stories: Story[]) {
  const total = stories.length;
  const withImages = stories.filter(s => s.imageUrl).length;
  const withVideos = stories.filter(s => s.videoUrl).length;
  const textOnly = stories.filter(s => s.mediaType === 'text').length;

  return {
    total,
    withImages,
    withVideos,
    textOnly,
    imagePercentage: ((withImages / total) * 100).toFixed(1),
    videoPercentage: ((withVideos / total) * 100).toFixed(1),
  };
}
