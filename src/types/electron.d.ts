interface CrawlProgress {
  stage: string;
  message: string;
  percent: number;
}

interface AppInfo {
  title: string;
  developer: string;
  icon: string;
  rating: number;
  ratingCount: number;
  price: string;
  description: string;
  version: string;
  genre: string;
  url: string;
  storeType: 'appstore' | 'playstore';
  lastUpdated: string;
}

interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  date: string;
}

interface CrawlResult {
  appInfo: AppInfo;
  reviews: ReviewItem[];
  crawledAt: string;
}

interface ElectronAPI {
  crawl: (input: string, maxReviews?: number) => Promise<{ success: boolean; data?: CrawlResult; error?: string }>;
  exportExcel: (data: CrawlResult) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  exportExcelDefault: (data: CrawlResult) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  onProgress: (callback: (progress: CrawlProgress) => void) => void;
  removeProgressListener: () => void;
  onUpdateAvailable: (callback: (version: string) => void) => void;
  onUpdateProgress: (callback: (percent: number) => void) => void;
  onUpdateDownloaded: (callback: (version: string) => void) => void;
  windowMinimize: () => void;
  windowMaximize: () => void;
  windowClose: () => void;
  windowIsMaximized: () => Promise<boolean>;
  getVersion: () => Promise<string>;
}

interface Window {
  api: ElectronAPI;
}
