'use client';

import { useState, useCallback } from 'react';

const APPSTORE_PATTERNS = [/apps\.apple\.com/, /^\d{6,}$/];
const PLAYSTORE_PATTERNS = [/play\.google\.com/, /^[\w]+\.[\w.]+$/];

type StoreType = 'appstore' | 'playstore' | null;

function detectStore(value: string): StoreType {
  const v = value.trim();
  if (!v) return null;
  if (APPSTORE_PATTERNS.some((p) => p.test(v))) return 'appstore';
  if (PLAYSTORE_PATTERNS.some((p) => p.test(v))) return 'playstore';
  return null;
}

interface SearchBarProps {
  onCrawl: (input: string, maxReviews: number) => void;
  loading: boolean;
}

const REVIEW_PRESETS = [50, 100, 200, 500] as const;

const EXAMPLES = [
  { label: 'Play Store', value: 'com.google.android.youtube' },
  { label: 'App Store', value: '544007664' },
];

export function SearchBar({ onCrawl, loading }: SearchBarProps) {
  const [input, setInput] = useState('');
  const [maxReviews, setMaxReviews] = useState(100);
  const store = detectStore(input);

  const handleSubmit = useCallback(() => {
    const v = input.trim();
    if (v) onCrawl(v, maxReviews);
  }, [input, maxReviews, onCrawl]);

  return (
    <div>
      {/* Input row */}
      <div className="flex items-center gap-2.5 bg-white border-[1.5px] border-slate-200 rounded-xl px-4 py-1.5 transition-all focus-within:border-blue-600 focus-within:ring-[3px] focus-within:ring-blue-600/10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="App Store / Play Store URL 또는 앱 ID를 입력하세요"
          spellCheck={false}
          className="flex-1 py-2.5 text-sm bg-transparent outline-none placeholder:text-slate-400"
        />

        {/* Store detect badge */}
        {store && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-opacity ${store === 'appstore'
                ? 'bg-sky-50 text-sky-700'
                : 'bg-emerald-50 text-emerald-700'
              }`}
          >
            {store === 'appstore' ? 'App Store' : 'Play Store'}
          </span>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg transition-all whitespace-nowrap"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>크롤링 중...</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
              <span>크롤링 시작</span>
            </>
          )}
        </button>
      </div>

      {/* Options row */}
      <div className="flex items-center justify-between mt-3 px-1">
        {/* Examples */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">예시:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.value}
              onClick={() => setInput(ex.value)}
              className="text-xs font-medium px-3 py-1 bg-white text-slate-500 border border-slate-200 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Review count */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">리뷰 수집:</span>
          <div className="flex items-center gap-1">
            {REVIEW_PRESETS.map((n) => (
              <button
                key={n}
                onClick={() => setMaxReviews(n)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${maxReviews === n
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                  }`}
              >
                {n}건
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-1">
            <input
              type="number"
              value={maxReviews}
              onChange={(e) => setMaxReviews(Math.max(1, Math.min(1000, Number(e.target.value) || 100)))}
              min={1}
              max={1000}
              className="w-16 text-xs text-center py-1 border border-slate-200 rounded-md outline-none focus:border-blue-400"
            />
            <span className="text-xs text-slate-400">건</span>
          </div>
        </div>
      </div>
    </div>
  );
}
