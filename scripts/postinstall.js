const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isPackaged = !process.defaultApp;

function getAppRoot() {
  if (isPackaged) {
    return path.join(process.resourcesPath, '..');
  }
  return path.join(__dirname, '..');
}

function log(msg) {
  console.log(`[setup] ${msg}`);
}

async function setup() {
  const root = getAppRoot();
  const outputDir = path.join(root, 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    log('output 디렉토리 생성 완료');
  }

  try {
    log('Playwright Chromium 브라우저 설치 중...');
    execSync('npx playwright install chromium', {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '0' },
    });
    log('Playwright Chromium 설치 완료');
  } catch (err) {
    log(`Playwright 설치 실패: ${err.message}`);
    log('수동 설치: npx playwright install chromium');
  }
}

setup();
