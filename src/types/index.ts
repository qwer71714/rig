export type StoreType = 'appstore' | 'playstore';

export interface ParsedInput {
  storeType: StoreType;
  id: string;
  originalInput: string;
}

export interface AppInfo {
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
  storeType: StoreType;
  lastUpdated: string;
}

export interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  date: string;
}

export interface CrawlResult {
  appInfo: AppInfo;
  reviews: ReviewItem[];
  crawledAt: string;
}

export interface CrawlProgress {
  stage: 'parsing' | 'app-info' | 'reviews' | 'done' | 'error';
  message: string;
  percent: number;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface IpcCrawlResponse {
  success: boolean;
  data?: CrawlResult;
  error?: string;
}
