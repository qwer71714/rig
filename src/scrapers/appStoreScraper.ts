import { AppInfo, ReviewItem } from '../types';
import { createPage, autoScroll } from './playwrightHelper';

const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';
const APPSTORE_REVIEWS_URL = 'https://apps.apple.com/kr/app/id';

interface iTunesResult {
  trackName: string;
  artistName: string;
  artworkUrl512?: string;
  artworkUrl100: string;
  averageUserRating: number;
  userRatingCount: number;
  formattedPrice: string;
  description: string;
  version: string;
  primaryGenreName: string;
  trackViewUrl: string;
  currentVersionReleaseDate: string;
}

export async function fetchAppInfo(appId: string): Promise<AppInfo> {
  const url = `${ITUNES_LOOKUP_URL}?id=${appId}&country=kr`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Apple API 요청 실패: ${response.status}`);
  }

  const data = (await response.json()) as { results?: iTunesResult[] };

  if (!data.results || data.results.length === 0) {
    throw new Error(`앱을 찾을 수 없습니다 (ID: ${appId})`);
  }

  const app = data.results[0];

  return {
    title: app.trackName,
    developer: app.artistName,
    icon: app.artworkUrl512 || app.artworkUrl100,
    rating: Math.round(app.averageUserRating * 10) / 10,
    ratingCount: app.userRatingCount,
    price: app.formattedPrice,
    description: app.description,
    version: app.version,
    genre: app.primaryGenreName,
    url: app.trackViewUrl,
    storeType: 'appstore',
    lastUpdated: app.currentVersionReleaseDate,
  };
}

export async function fetchReviews(
  appId: string,
  maxReviews: number = 100
): Promise<ReviewItem[]> {
  const reviews: ReviewItem[] = [];

  const rssReviews = await fetchRssReviews(appId, maxReviews);
  reviews.push(...rssReviews);

  if (reviews.length < maxReviews) {
    const playwrightReviews = await scrapeReviewsWithPlaywright(appId, maxReviews - reviews.length);
    const existingIds = new Set(reviews.map((r) => r.id));
    for (const review of playwrightReviews) {
      if (!existingIds.has(review.id)) {
        reviews.push(review);
      }
    }
  }

  return reviews.slice(0, maxReviews);
}

async function fetchRssReviews(appId: string, maxReviews: number): Promise<ReviewItem[]> {
  const reviews: ReviewItem[] = [];
  const maxPages = Math.min(Math.ceil(maxReviews / 50), 10);

  for (let page = 1; page <= maxPages; page++) {
    if (reviews.length >= maxReviews) break;

    try {
      const url = `https://itunes.apple.com/kr/rss/customerreviews/page=${page}/id=${appId}/sortby=mostrecent/json`;
      const response = await fetch(url);

      if (!response.ok) break;

      const data = (await response.json()) as { feed?: { entry?: Record<string, any>[] } };
      const entries = data?.feed?.entry;

      if (!entries || !Array.isArray(entries)) break;

      for (const entry of entries) {
        if (!entry['im:rating']) continue;

        reviews.push({
          id: entry.id?.label || `rss-${page}-${reviews.length}`,
          userName: entry.author?.name?.label || '익명',
          rating: parseInt(entry['im:rating'].label, 10),
          title: entry.title?.label || '',
          text: entry.content?.label || '',
          date: entry.updated?.label || '',
        });
      }
    } catch {
      break;
    }
  }

  return reviews;
}

async function scrapeReviewsWithPlaywright(
  appId: string,
  maxCount: number
): Promise<ReviewItem[]> {
  const reviews: ReviewItem[] = [];
  let context;

  try {
    const result = await createPage();
    context = result.context;
    const page = result.page;

    await page.goto(`${APPSTORE_REVIEWS_URL}${appId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const seeAllButton = page.locator('a:has-text("모든 리뷰 보기"), a:has-text("See All Reviews")').first();
    if (await seeAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await seeAllButton.click();
      await page.waitForTimeout(3000);
    }

    const scrollCount = Math.min(Math.ceil(maxCount / 5), 80);
    await autoScroll(page, scrollCount);

    const reviewElements = await page.locator('.we-customer-review').all();

    for (const el of reviewElements.slice(0, maxCount)) {
      try {
        const title = await el.locator('.we-customer-review__title').textContent().catch(() => '') || '';
        const text = await el.locator('.we-customer-review__body').textContent().catch(() => '') || '';
        const userName = await el.locator('.we-customer-review__user').textContent().catch(() => '익명') || '익명';
        const dateText = await el.locator('.we-customer-review__date').textContent().catch(() => '') || '';

        const starFigure = el.locator('figure.we-star-rating');
        const ariaLabel = await starFigure.getAttribute('aria-label').catch(() => '') || '';
        const ratingMatch = ariaLabel.match(/(\d)/);
        const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

        if (!text.trim()) continue;

        reviews.push({
          id: `pw-appstore-${reviews.length}`,
          userName: userName.trim(),
          rating,
          title: title.trim(),
          text: text.trim(),
          date: dateText.trim(),
        });
      } catch {
        continue;
      }
    }
  } catch {
    // best-effort
  } finally {
    if (context) await context.close();
  }

  return reviews;
}
