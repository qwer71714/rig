'use client';

interface AppInfo {
  title: string;
  developer: string;
  icon: string;
  rating: number;
  ratingCount: number;
  price: string;
  version: string;
  genre: string;
  storeType: 'appstore' | 'playstore';
  lastUpdated: string;
}

interface AppInfoCardProps {
  appInfo: AppInfo;
}

const DETAILS_KEYS: { label: string; key: keyof AppInfo; format?: (v: string) => string }[] = [
  { label: '카테고리', key: 'genre' },
  { label: '버전', key: 'version' },
  {
    label: '스토어',
    key: 'storeType',
    format: (v) => (v === 'appstore' ? 'App Store' : 'Google Play'),
  },
  {
    label: '최종 업데이트',
    key: 'lastUpdated',
    format: (v) => (v ? String(v).slice(0, 10) : 'N/A'),
  },
];

export function AppInfoCard({ appInfo }: AppInfoCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Top section */}
      <div className="flex items-center gap-4 p-5">
        {/* Icon */}
        <img
          src={appInfo.icon}
          alt={appInfo.title}
          className="w-16 h-16 rounded-xl object-cover shadow-sm"
        />

        {/* Title / Developer */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold tracking-tight truncate">{appInfo.title}</h2>
          <p className="text-[13px] text-slate-500 mt-0.5">{appInfo.developer}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <Stat value={String(appInfo.rating)} label="평점" />
          <Stat value={appInfo.ratingCount.toLocaleString()} label="평가 수" />
          <Stat value={appInfo.price} label="가격" />
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-4 border-t border-slate-200">
        {DETAILS_KEYS.map((d, i) => {
          const raw = String(appInfo[d.key]);
          const display = d.format ? d.format(raw) : raw;
          return (
            <div
              key={d.key}
              className={`flex flex-col px-5 py-3.5 ${i < 3 ? 'border-r border-slate-200' : ''}`}
            >
              <span className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                {d.label}
              </span>
              <span className="text-[13px] font-semibold text-slate-900 truncate">
                {display}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-slate-900">{value}</span>
      <span className="text-[11px] text-slate-400 mt-0.5">{label}</span>
    </div>
  );
}
