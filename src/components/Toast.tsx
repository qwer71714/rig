'use client';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="px-6 py-3 bg-slate-900 text-white text-[13px] font-medium rounded-lg shadow-xl">
        {message}
      </div>
    </div>
  );
}
