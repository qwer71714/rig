import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { autoUpdater } from 'electron-updater';
import { CrawlService } from '../src/services/crawlService';
import { ExcelExporter } from '../src/utils/excelExporter';
import { CrawlResult, IpcCrawlResponse, ExportResult } from '../src/types';
import { pathToFileURL } from 'url';

const isDev = process.argv.includes('--dev');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const outDir = path.join(__dirname, '..', '..', 'out');

  if (!isDev) {
    protocol.handle('app', (request) => {
      const url = new URL(request.url);
      let filePath = decodeURIComponent(url.pathname);

      if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
      }

      const fullPath = path.join(outDir, filePath);
      return net.fetch(pathToFileURL(fullPath).toString());
    });
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    backgroundColor: '#f8fafc',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('app://./index.html');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  if (!isDev) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- Auto Updater Events ---

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update:available', info.version);
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('update:progress', Math.round(progress.percent));
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('update:downloaded', info.version);
  dialog.showMessageBox({
    type: 'info',
    title: '업데이트 준비 완료',
    message: `v${info.version}이(가) 다운로드되었습니다.\n앱을 재시작하면 자동 적용됩니다.`,
    buttons: ['지금 재시작', '나중에'],
  }).then(({ response }) => {
    if (response === 0) autoUpdater.quitAndInstall();
  });
});

// --- IPC Handlers ---

ipcMain.handle('crawl:start', async (_event, input: string, maxReviews: number = 100): Promise<IpcCrawlResponse> => {
  const crawlService = new CrawlService();

  crawlService.onProgress((progress) => {
    mainWindow?.webContents.send('crawl:progress', progress);
  });

  try {
    const data = await crawlService.crawl(input, maxReviews);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  } finally {
    await crawlService.close();
  }
});

ipcMain.handle('crawl:export', async (_event, data: CrawlResult): Promise<ExportResult> => {
  if (!mainWindow) return { success: false, error: 'No window' };

  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Excel 파일 저장',
    defaultPath: path.join(
      app.getPath('documents'),
      `crawl_result_${Date.now()}.xlsx`
    ),
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
  });

  if (!filePath) return { success: false, error: 'cancelled' };

  try {
    const exporter = new ExcelExporter();
    await exporter.export(data, filePath);
    return { success: true, filePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
});

ipcMain.handle('crawl:exportDefault', async (_event, data: CrawlResult): Promise<ExportResult> => {
  const outputDir = path.join(__dirname, '..', '..', 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const fileName = `${data.appInfo?.title || 'result'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const safeName = fileName.replace(/[<>:"/\\|?*]/g, '_');
  const filePath = path.join(outputDir, safeName);

  try {
    const exporter = new ExcelExporter();
    await exporter.export(data, filePath);
    return { success: true, filePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
});
