# CI/CD 가이드 — GitHub Actions + Docker + Auto Update

```
 Developer ──push──▶ GitHub ──trigger──▶ GitHub Actions
                        │                    │
                   Pull Request         ┌────┼────┐
                        │               ▼    ▼    ▼
                   Code Review        Win  macOS Linux
                                      .exe .dmg .AppImage
                                        └────┼────┘
                                             ▼
                                      GitHub Releases
                                             ▼
                                      electron-updater
                                      (사용자 앱 자동 업데이트)
```

---

## 1. 워크플로우 구조

```
.github/workflows/
├── ci.yml              ← push/PR 시 Lint + TypeCheck + Build 검증
├── release.yml         ← 태그(v*) push 시 3개 OS 빌드 + GitHub Release
└── docker-build.yml    ← main push 시 Docker 이미지 빌드 + GHCR push
```

---

## 2. CI (자동 검증)

> `ci.yml` — push/PR 시 자동 실행

| 단계 | 내용 |
|---|---|
| Lint & Type Check | `tsc --noEmit` (Electron + Next.js) |
| Build Test | `npm run build` 후 출력 파일 존재 확인 |

트리거: `main`, `develop` 브랜치 push + `main` 대상 PR

---

## 3. Release (자동 배포)

> `release.yml` — `v*` 태그 push 시 자동 실행

### 파이프라인 흐름

```
v1.2.0 태그 push
       ↓
  ┌────┼────┐        (3개 OS 병렬 빌드)
  ▼    ▼    ▼
 Win  Mac  Linux
  │    │    │
  └────┼────┘
       ▼
 GitHub Releases     ← .exe, .dmg, .AppImage 자동 업로드
       ▓
 사용자 앱에서 감지    ← electron-updater
       ▓
 "업데이트가 있습니다" 알림 → 재시작 → 적용 완료
```

### 배포 방법

```bash
# 1. 버전 올리기
npm version patch     # 1.0.0 → 1.0.1 (버그 수정)
npm version minor     # 1.0.0 → 1.1.0 (기능 추가)
npm version major     # 1.0.0 → 2.0.0 (대규모 변경)

# 2. 태그와 함께 push (이것만 하면 끝)
git push --follow-tags
```

`npm version`은 자동으로:
- `package.json`의 `version` 수정
- `git commit` 생성
- `git tag v1.0.1` 생성

---

## 4. Docker (크롤러 CLI 이미지)

> `docker-build.yml` — `main` push 시 자동 실행

Dockerfile 또는 소스 변경 시 Docker 이미지를 빌드하여 **GitHub Container Registry (GHCR)** 에 자동 push 합니다.

### 이미지 사용법

```bash
# GHCR에서 이미지 pull
docker pull ghcr.io/<owner>/rig:latest

# CLI 크롤링 실행
docker run --rm -v $(pwd)/output:/app/output \
  ghcr.io/<owner>/rig:latest \
  node dist-electron/src/services/crawlService.js <URL_OR_ID>
```

### 로컬 Docker 테스트

```bash
docker compose build
docker compose run --rm crawler node dist-electron/src/services/crawlService.js <URL_OR_ID>
```

---

## 5. 자동 업데이트 (electron-updater)

앱이 실행될 때 자동으로 GitHub Releases에서 새 버전을 확인합니다.

### 동작 과정

1. 앱 실행 시 `autoUpdater.checkForUpdatesAndNotify()` 호출
2. GitHub Releases에 새 버전이 있으면 백그라운드 다운로드
3. 다운로드 완료 시 "업데이트 준비 완료" 다이얼로그 표시
4. "지금 재시작" 클릭 → 앱 재시작 + 자동 적용

### 설정 (package.json)

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "releaseType": "release"
      }
    ]
  }
}
```

**사용자는 아무것도 할 필요 없음** — 앱을 열기만 하면 자동으로 최신 버전이 적용됩니다.

---

## 6. GitHub 저장소 초기 설정

### 6-1. 저장소 생성 및 push

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<owner>/app-store-crawler.git
git push -u origin main
```

### 6-2. GitHub 설정

Settings → Actions → General:
- ☑ Allow all actions and reusable workflows
- Workflow permissions: **Read and write permissions**

Settings → Packages:
- Visibility: Public (Docker 이미지 공개 시)

### 6-3. 첫 번째 릴리즈

```bash
npm version 1.0.0
git push --follow-tags
```

→ GitHub Actions가 자동으로 3개 OS 빌드 후 Release 생성

---

## 7. 개발 워크플로우 요약

| 상황 | 명령어 | 일어나는 일 |
|---|---|---|
| 일상 개발 | `npm run dev` | 로컬 Hot Reload (빌드 불필요) |
| 코드 push | `git push` | CI 자동 실행 (Lint + Build 검증) |
| PR 생성 | GitHub PR | CI 자동 실행 + 리뷰 |
| 릴리즈 | `npm version patch && git push --follow-tags` | 3개 OS 빌드 → Release → 사용자 자동 업데이트 |
| Docker | `git push` (main) | Docker 이미지 빌드 → GHCR push |

---

## 8. 트러블슈팅

### GitHub Actions 빌드 실패

```bash
# 로컬에서 동일하게 검증
npm ci && npm run build
npx tsc -p tsconfig.electron.json --noEmit
```

### electron-updater가 업데이트를 못 찾을 때

- GitHub Releases에 `latest.yml` (또는 `latest-mac.yml`, `latest-linux.yml`)이 있는지 확인
- `electron-builder`가 `--publish always`로 빌드되었는지 확인
- `package.json`의 `build.publish` 설정 확인

### Docker 이미지 push 실패

- Settings → Packages → 권한 확인
- `GITHUB_TOKEN`은 자동 제공되지만, org 레포는 별도 PAT 필요할 수 있음

### Playwright 설치 실패 (CI 환경)

```bash
# 시스템 의존성 포함 설치
npx playwright install --with-deps chromium
```
