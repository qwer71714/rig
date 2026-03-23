import { contextBridge, ipcRenderer } from 'electron';
import { CrawlResult, CrawlProgress, IpcCrawlResponse, ExportResult } from '../src/types';

contextBridge.exposeInMainWorld('api', {
  crawl: (input: string, maxReviews?: number): Promise<IpcCrawlResponse> =>
    ipcRenderer.invoke('crawl:start', input, maxReviews ?? 100),

  exportExcel: (data: CrawlResult): Promise<ExportResult> =>
    ipcRenderer.invoke('crawl:export', data),

  exportExcelDefault: (data: CrawlResult): Promise<ExportResult> =>
    ipcRenderer.invoke('crawl:exportDefault', data),

  onProgress: (callback: (progress: CrawlProgress) => void): void => {
    ipcRenderer.on('crawl:progress', (_event, progress: CrawlProgress) => callback(progress));
  },

  removeProgressListener: (): void => {
    ipcRenderer.removeAllListeners('crawl:progress');
  },

  onUpdateAvailable: (callback: (version: string) => void): void => {
    ipcRenderer.on('update:available', (_e, version) => callback(version));
  },

  onUpdateProgress: (callback: (percent: number) => void): void => {
    ipcRenderer.on('update:progress', (_e, percent) => callback(percent));
  },

  onUpdateDownloaded: (callback: (version: string) => void): void => {
    ipcRenderer.on('update:downloaded', (_e, version) => callback(version));
  },
});
