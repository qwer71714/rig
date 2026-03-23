FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    ca-certificates \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

RUN npx playwright install --with-deps chromium

COPY tsconfig.electron.json ./
COPY electron/ ./electron/
COPY src/types/ ./src/types/
COPY src/scrapers/ ./src/scrapers/
COPY src/services/ ./src/services/
COPY src/utils/ ./src/utils/

RUN npx tsc -p tsconfig.electron.json

VOLUME ["/app/output"]

CMD ["node", "dist-electron/src/services/crawlService.js"]
