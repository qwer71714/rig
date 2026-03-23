import gplay from 'google-play-scraper';
import { AppInfo, ReviewItem } from '../types';
import { createPage, autoScroll } from './playwrightHelper';

export async function fetchAppInfo(appId: string): Promise<AppInfo> {
  const app = await gplay.app({ appId, lang: 'ko', country: 'kr' });

  return {
    title: app.title,
    developer: app.developer,
    icon: app.icon,
    rating: Math.round((app.score || 0) * 10) / 10,
    ratingCount: app.ratings || 0,
    price: app.priceText || '무료',
    description: app.description,
    version: app.version || 'N/A',
    genre: app.genre || 'N/A',
    url: app.url,
    storeType: 'playstore',
    lastUpdated: app.updated ? String(app.updated) : 'N/A',
  };
}

export async function fetchReviews(
  appId: string,
  maxReviews: number = 100
): Promise<ReviewItem[]> {
  const reviews: ReviewItem[] = [];

  const libraryReviews = await fetchLibraryReviews(appId, maxReviews);
  reviews.push(...libraryReviews);

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

async function fetchLibraryReviews(
  appId: string,
  maxReviews: number
): Promise<ReviewItem[]> {
  const reviews: ReviewItem[] = [];
  let token: string | undefined = undefined;
  const perPage = 150;

  try {
    while (reviews.length < maxReviews) {
      const result: any = await gplay.reviews({
        appId,
        lang: 'ko',
        country: 'kr',
        sort: gplay.sort.NEWEST,
        num: Math.min(perPage, maxReviews - reviews.length),
        ...(token ? { paginate: true, nextPaginationToken: token } : {}),
      } as any);

      const items: any[] = Array.isArray(result) ? result : (result?.data ?? []);
      const nextToken: string | undefined = result?.nextPaginationToken;

      if (items.length === 0) break;

      for (const review of items) {
        reviews.push({
          id: review.id || `gplay-${reviews.length}`,
          userName: review.userName || '익명',
          rating: review.score ?? 0,
          title: review.title || '',
          text: review.text || '',
          date: review.date ? String(review.date) : '',
        });
      }

      if (!nextToken || reviews.length >= maxReviews) break;
      token = nextToken;
    }
  } catch {
    // best-effort
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

    const url = `https://play.google.com/store/apps/details?id=${appId}&hl=ko&gl=kr`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const reviewButton = page.locator('button:has-text("리뷰 모두 보기"), button:has-text("See all reviews")').first();
    if (await reviewButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reviewButton.click();
      await page.waitForTimeout(3000);
    }

    const scrollCount = Math.min(Math.ceil(maxCount / 5), 80);
    await autoScroll(page, scrollCount);

    const reviewCards = await page.locator('div[data-review-id], div.RHo1pe').all();

    for (const card of reviewCards.slice(0, maxCount)) {
      try {
        const userName = await card.locator('.X5PpBb, span[class*="bp9Aid"]').first().textContent().catch(() => '익명') || '익명';
        const text = await card.locator('.h3YV2d, div[jsname="fbQN7e"]').first().textContent().catch(() => '') || '';
        const dateText = await card.locator('.bp9Aid, span[class*="p2TkOb"]').first().textContent().catch(() => '') || '';

        const starEl = card.locator('div.pf5lIe [role="img"], [aria-label*="별점"], [aria-label*="Rated"]').first();
        const starLabel = await starEl.getAttribute('aria-label').catch(() => '') || '';
        const ratingMatch = starLabel.match(/(\d)/);
        const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

        if (!text.trim()) continue;

        reviews.push({
          id: `pw-playstore-${reviews.length}`,
          userName: userName.trim(),
          rating,
          title: '',
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
