'use client';

import { useState, useEffect, useCallback } from 'react';

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  const checkMaximized = useCallback(async () => {
    if (typeof window !== 'undefined' && window.api?.windowIsMaximized) {
      setMaximized(await window.api.windowIsMaximized());
    }
  }, []);

  useEffect(() => {
    checkMaximized();
    window.addEventListener('resize', checkMaximized);
    return () => window.removeEventListener('resize', checkMaximized);
  }, [checkMaximized]);

  const handleMinimize = () => window.api?.windowMinimize();
  const handleMaximize = () => {
    window.api?.windowMaximize();
    setTimeout(checkMaximized, 50);
  };
  const handleClose = () => window.api?.windowClose();

  return (
    <div className="flex items-center justify-between h-11 bg-white border-b border-slate-200/80 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-2.5 pl-4">
        <div className="flex items-center justify-center w-7 h-7 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-slate-700 tracking-tight">
          App Store Crawler
        </span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded">
          v1.0
        </span>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-12 h-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="최소화"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect y="5.5" width="12" height="1" rx="0.5" fill="currentColor" />
          </svg>
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-12 h-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label={maximized ? '이전 크기로' : '최대화'}
        >
          {maximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4.5 3.5V2.5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1.5" y="1.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-12 h-full text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
          aria-label="닫기"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
