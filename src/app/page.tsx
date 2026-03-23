'use client';

import { useState, useCallback } from 'react';
import { TitleBar } from '@/components/TitleBar';
import { SearchBar } from '@/components/SearchBar';
import { AppInfoCard } from '@/components/AppInfoCard';
import { ReviewsTable } from '@/components/ReviewsTable';
import { ProgressBar } from '@/components/ProgressBar';
import { Toast } from '@/components/Toast';

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

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<CrawlProgress | null>(null);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleCrawl = useCallback(async (input: string, maxReviews: number) => {
    if (!window.api) {
      setError('Electron API를 사용할 수 없습니다. Electron 환경에서 실행해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress({ stage: 'parsing', message: '준비 중...', percent: 0 });

    window.api.onProgress((p: CrawlProgress) => {
      setProgress(p);
    });

    const res = await window.api.crawl(input, maxReviews);
    window.api.removeProgressListener();

    if (res.success && res.data) {
      setResult(res.data);
      setProgress(null);
    } else {
      setError(res.error || '알 수 없는 오류가 발생했습니다.');
      setProgress(null);
    }

    setLoading(false);
  }, []);

  const handleExport = useCallback(async () => {
    if (!result || !window.api) return;
    const res = await window.api.exportExcel(result);
    if (res.success) {
      showToast(`저장 완료: ${res.filePath}`);
    } else if (res.error !== 'cancelled') {
      showToast(`저장 실패: ${res.error}`);
    }
  }, [result, showToast]);

  const handleExportDefault = useCallback(async () => {
    if (!result || !window.api) return;
    const res = await window.api.exportExcelDefault(result);
    if (res.success) {
      showToast(`저장 완료: ${res.filePath}`);
    } else {
      showToast(`저장 실패: ${res.error}`);
    }
  }, [result, showToast]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
      {/* Search */}
      <section className="px-7 pt-6">
        <SearchBar onCrawl={handleCrawl} loading={loading} />
      </section>

      {/* Progress */}
      {progress && (
        <section className="px-7 pt-5">
          <ProgressBar percent={progress.percent} message={progress.message} />
        </section>
      )}

      {/* Error */}
      {error && (
        <section className="px-7 pt-6">
          <div className="flex items-start gap-3 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm leading-relaxed">
            <svg className="shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <p>{error}</p>
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <>
          <section className="px-7 pt-6">
            <AppInfoCard appInfo={result.appInfo} />
          </section>

          <section className="px-7 py-6">
            <ReviewsTable
              reviews={result.reviews}
              onExport={handleExport}
              onExportDefault={handleExportDefault}
            />
          </section>
        </>
      )}

      {/* Toast */}
      <Toast message={toast} />
      </main>
    </div>
  );
}
