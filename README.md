# App Store Crawler

App Store / Google Play Store 앱 정보 및 리뷰를 크롤링하여 Excel로 저장하는 Electron 데스크톱 앱.

## 기능

- **자동 감지**: URL 또는 앱 ID만 입력하면 App Store / Play Store 자동 판별
- **앱 정보 수집**: 이름, 개발자, 평점, 가격, 카테고리, 버전, 설명 등
- **리뷰 수집**: RSS Feed API / google-play-scraper + Playwright 조합
- **Excel 내보내기**: 앱 정보 시트 + 리뷰 시트로 구분된 `.xlsx` 파일 생성

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Electron + Next.js (App Router) |
| 언어 | TypeScript |
| UI | React + Tailwind CSS v4 |
| 크롤링 | Playwright, google-play-scraper, Apple iTunes API |
| Excel | ExcelJS |
| 개발환경 | Docker |

## 시작하기

### 로컬 개발

```bash
# 의존성 설치
npm install

# Playwright 브라우저 설치
npm run install:pw

# 개발 모드 (Next.js dev + Electron 동시 실행)
npm run dev

# 프로덕션 빌드 후 실행
npm start
```

### Docker 개발 (CLI 크롤링)

```bash
# Docker 이미지 빌드
npm run docker:build

# CLI 모드로 크롤링 실행
docker-compose run --rm crawler node dist-electron/src/services/crawlService.js com.google.android.youtube

# 결과는 ./output/ 디렉토리에 Excel로 저장됨
```

## 입력 형식

| 스토어 | URL 형식 | ID 형식 |
|--------|----------|---------|
| App Store | `https://apps.apple.com/kr/app/.../id544007664` | `544007664` |
| Play Store | `https://play.google.com/store/apps/details?id=com.example.app` | `com.example.app` |

## 프로젝트 구조

```
rig/
├── package.json
├── tsconfig.json                 # Next.js용
├── tsconfig.electron.json        # Electron 메인 프로세스용
├── next.config.ts                # Next.js 설정 (static export)
├── postcss.config.mjs            # Tailwind PostCSS
├── Dockerfile / docker-compose.yml
│
├── electron/                     # Electron 프로세스
│   ├── main.ts                   # dev: loadURL / prod: loadFile
│   └── preload.ts                # IPC bridge
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/               # React 컴포넌트
│   │   ├── SearchBar.tsx
│   │   ├── AppInfoCard.tsx
│   │   ├── ReviewsTable.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Toast.tsx
│   ├── types/                    # TypeScript 타입 정의
│   ├── scrapers/                 # 스토어별 스크래퍼
│   ├── services/                 # 비즈니스 로직
│   └── utils/                    # 유틸리티
│
├── public/
└── output/                       # Excel 결과 저장
```

## 설치 / 배포

자세한 설치 가이드는 [INSTALL.md](INSTALL.md)를 참고하세요.

```bash
# Windows 설치 파일 빌드
npm run dist:win

# macOS 설치 파일 빌드
npm run dist:mac

# Linux AppImage 빌드
npm run dist:linux
```

빌드 결과는 `release/` 디렉토리에 생성됩니다.

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Next.js dev + Electron 동시 실행 |
| `npm run build` | Electron TS 컴파일 + Next.js 빌드 |
| `npm start` | 빌드 후 Electron 앱 실행 |
| `npm run install:pw` | Playwright Chromium 설치 |
| `npm run dist` | 현재 OS용 설치파일 빌드 |
| `npm run dist:win` | Windows .exe 설치파일 |
| `npm run dist:mac` | macOS .dmg |
| `npm run dist:linux` | Linux .AppImage |
| `npm run docker:build` | Docker 이미지 빌드 |
| `npm run docker:crawl` | Docker CLI 크롤링 |
