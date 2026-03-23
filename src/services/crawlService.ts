import { parseInput } from '../utils/urlParser';
import * as appStoreScraper from '../scrapers/appStoreScraper';
import * as playStoreScraper from '../scrapers/playStoreScraper';
import { closeBrowser } from '../scrapers/playwrightHelper';
import { CrawlResult, CrawlProgress } from '../types';

type ProgressCallback = (progress: CrawlProgress) => void;

export class CrawlService {
  private progressCallback: ProgressCallback | null = null;

  onProgress(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  private emit(progress: CrawlProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async crawl(input: string, maxReviews: number = 100): Promise<CrawlResult> {
    this.emit({ stage: 'parsing', message: '입력값 분석 중...', percent: 5 });

    const parsed = parseInput(input);

    this.emit({
      stage: 'app-info',
      message: `${parsed.storeType === 'appstore' ? 'App Store' : 'Play Store'} 앱 정보 수집 중...`,
      percent: 15,
    });

    let appInfo;
    let reviews;

    if (parsed.storeType === 'appstore') {
      appInfo = await appStoreScraper.fetchAppInfo(parsed.id);

      this.emit({ stage: 'reviews', message: `리뷰 데이터 수집 중 (최대 ${maxReviews}건)...`, percent: 50 });
      reviews = await appStoreScraper.fetchReviews(parsed.id, maxReviews);
    } else {
      appInfo = await playStoreScraper.fetchAppInfo(parsed.id);

      this.emit({ stage: 'reviews', message: `리뷰 데이터 수집 중 (최대 ${maxReviews}건)...`, percent: 50 });
      reviews = await playStoreScraper.fetchReviews(parsed.id, maxReviews);
    }

    this.emit({ stage: 'done', message: '크롤링 완료!', percent: 100 });

    return {
      appInfo,
      reviews,
      crawledAt: new Date().toISOString(),
    };
  }

  async close(): Promise<void> {
    await closeBrowser();
  }
}

// CLI mode: `node crawlService.js <url-or-id> [maxReviews]`
if (require.main === module) {
  const input = process.argv[2];
  const maxReviews = parseInt(process.argv[3], 10) || 100;
  if (!input) {
    console.error('사용법: node crawlService.js <URL 또는 앱 ID> [리뷰수]');
    process.exit(1);
  }

  (async () => {
    const { ExcelExporter } = await import('../utils/excelExporter');
    const path = await import('path');
    const fs = await import('fs');

    const service = new CrawlService();
    service.onProgress((p) => console.log(`[${p.percent}%] ${p.message}`));

    try {
      const result = await service.crawl(input, maxReviews);
      console.log(`\n앱: ${result.appInfo.title}`);
      console.log(`리뷰: ${result.reviews.length}건 수집\n`);

      const outputDir = path.join(__dirname, '../../output');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const safeName = `${result.appInfo.title}_${new Date().toISOString().slice(0, 10)}.xlsx`
        .replace(/[<>:"/\\|?*]/g, '_');
      const filePath = path.join(outputDir, safeName);

      const exporter = new ExcelExporter();
      await exporter.export(result, filePath);
      console.log(`Excel 저장 완료: ${filePath}`);
    } catch (err) {
      console.error('크롤링 실패:', err instanceof Error ? err.message : err);
      process.exit(1);
    } finally {
      await service.close();
    }
  })();
}
