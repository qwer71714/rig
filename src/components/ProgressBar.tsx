'use client';

interface ProgressBarProps {
  percent: number;
  message: string;
}

export function ProgressBar({ percent, message }: ProgressBarProps) {
  return (
    <div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-[width] duration-400 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[13px] text-slate-500">{message}</p>
    </div>
  );
}
