# App Store Crawler - 설치 가이드

## 사전 요구 사항

| 항목 | 최소 버전 | 확인 명령 |
|------|-----------|-----------|
| Node.js | v18 이상 | `node -v` |
| npm | v9 이상 | `npm -v` |
| Git | - | `git --version` |

> Node.js가 없다면: https://nodejs.org 에서 LTS 버전 다운로드

---

## 방법 1: 개발자 모드 (소스에서 실행)

### 1단계: 소스 코드 다운로드

```bash
git clone <repository-url>
cd rig
```

### 2단계: 의존성 설치

```bash
npm install
```

### 3단계: Playwright 브라우저 설치

```bash
npm run install:pw
```

> Chromium 브라우저를 자동으로 다운로드합니다 (약 150MB).

### 4단계: 실행

```bash
# 개발 모드 (Hot Reload + DevTools)
npm run dev

# 프로덕션 모드
npm start
```

---

## 방법 2: 설치 파일 빌드 (배포용)

### Windows (.exe 설치파일)

```bash
npm run dist:win
```

빌드 완료 후 `release/` 폴더에 설치 파일이 생성됩니다:

```
release/
  └── App Store Crawler Setup 1.0.0.exe
```

더블클릭으로 설치 진행:
1. 설치 경로 선택
2. 바탕화면 바로가기 자동 생성
3. 시작 메뉴에 등록

### macOS (.dmg)

```bash
npm run dist:mac
```

```
release/
  └── App Store Crawler-1.0.0.dmg
```

DMG 파일을 열고 Applications 폴더로 드래그하여 설치.

### Linux (.AppImage)

```bash
npm run dist:linux
```

```
release/
  └── App Store Crawler-1.0.0.AppImage
```

```bash
chmod +x "App Store Crawler-1.0.0.AppImage"
./"App Store Crawler-1.0.0.AppImage"
```

---

## 방법 3: Docker (CLI 크롤링 전용)

Electron UI 없이 커맨드라인에서 크롤링만 수행합니다.

```bash
# 이미지 빌드
npm run docker:build

# 크롤링 실행 (예: YouTube 앱)
docker-compose run --rm crawler \
  node dist-electron/src/services/crawlService.js com.google.android.youtube 200

# 결과 확인
ls output/
```

---

## 설치 후 Playwright 브라우저 설정

설치 파일로 앱을 배포한 경우, 최초 1회 Playwright 브라우저를 다운로드해야 합니다:

```bash
# 앱 설치 경로에서 실행
npx playwright install chromium
```

또는 앱 내부의 postinstall 스크립트가 자동으로 처리합니다.

---

## 문제 해결

### `spawn cmd.exe ENOENT` (Windows)

Windows PATH에 `C:\WINDOWS\system32`이 포함되어 있지 않은 경우 발생합니다.

**해결:** 환경 변수에서 PATH에 `C:\WINDOWS\system32` 추가
```
시스템 속성 → 고급 → 환경 변수 → Path → 편집 → C:\WINDOWS\system32 추가
```

### `Cannot find module 'playwright'`

Playwright가 설치되지 않은 상태입니다.

```bash
npm run install:pw
```

### 빌드 시 `EPERM` 에러

이전 빌드 캐시가 잠긴 경우입니다.

```bash
# Windows
Remove-Item -Recurse -Force .next, out -ErrorAction SilentlyContinue

# macOS/Linux
rm -rf .next out
```

다시 빌드를 실행합니다.

### Excel 파일이 저장되지 않음

`output/` 디렉토리에 쓰기 권한이 있는지 확인하세요.

```bash
mkdir -p output
```

---

## 스크립트 요약

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 모드 실행 (Next.js + Electron) |
| `npm start` | 프로덕션 빌드 후 실행 |
| `npm run build` | TypeScript + Next.js 빌드 |
| `npm run install:pw` | Playwright Chromium 설치 |
| `npm run pack` | 앱 패키징 (설치파일 없이 폴더) |
| `npm run dist` | 현재 OS용 설치파일 빌드 |
| `npm run dist:win` | Windows .exe 설치파일 빌드 |
| `npm run dist:mac` | macOS .dmg 빌드 |
| `npm run dist:linux` | Linux .AppImage 빌드 |
| `npm run docker:build` | Docker 이미지 빌드 |
| `npm run docker:crawl` | Docker CLI 크롤링 |
