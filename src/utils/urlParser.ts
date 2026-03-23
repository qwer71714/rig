import { ParsedInput, StoreType } from '../types';

const APPSTORE_URL_PATTERN = /apps\.apple\.com\/\w+\/app\/[^/]+\/id(\d+)/;
const APPSTORE_ID_PATTERN = /^(\d{6,})$/;

const PLAYSTORE_URL_PATTERN = /play\.google\.com\/store\/apps\/details\?id=([\w.]+)/;
const PLAYSTORE_ID_PATTERN = /^([\w]+\.[\w.]+)$/;

export function parseInput(input: string): ParsedInput {
  const trimmed = input.trim();

  const appStoreUrlMatch = trimmed.match(APPSTORE_URL_PATTERN);
  if (appStoreUrlMatch) {
    return {
      storeType: 'appstore',
      id: appStoreUrlMatch[1],
      originalInput: trimmed,
    };
  }

  const playStoreUrlMatch = trimmed.match(PLAYSTORE_URL_PATTERN);
  if (playStoreUrlMatch) {
    return {
      storeType: 'playstore',
      id: playStoreUrlMatch[1],
      originalInput: trimmed,
    };
  }

  if (APPSTORE_ID_PATTERN.test(trimmed)) {
    return {
      storeType: 'appstore',
      id: trimmed,
      originalInput: trimmed,
    };
  }

  if (PLAYSTORE_ID_PATTERN.test(trimmed)) {
    return {
      storeType: 'playstore',
      id: trimmed,
      originalInput: trimmed,
    };
  }

  throw new Error(
    `입력값을 인식할 수 없습니다: "${trimmed}"\n` +
    '지원 형식:\n' +
    '  - App Store URL: https://apps.apple.com/.../id123456789\n' +
    '  - App Store ID: 123456789\n' +
    '  - Play Store URL: https://play.google.com/store/apps/details?id=com.example.app\n' +
    '  - Play Store ID: com.example.app'
  );
}

export function detectStoreType(input: string): StoreType | null {
  const trimmed = input.trim();

  if (APPSTORE_URL_PATTERN.test(trimmed) || APPSTORE_ID_PATTERN.test(trimmed)) {
    return 'appstore';
  }
  if (PLAYSTORE_URL_PATTERN.test(trimmed) || PLAYSTORE_ID_PATTERN.test(trimmed)) {
    return 'playstore';
  }

  return null;
}
