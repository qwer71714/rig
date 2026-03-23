'use client';

interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  date: string;
}

interface ReviewsTableProps {
  reviews: ReviewItem[];
  onExport: () => void;
  onExportDefault: () => void;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-amber-400 text-xs tracking-wider">
      {'★'.repeat(count)}{'☆'.repeat(Math.max(0, 5 - count))}
    </span>
  );
}

export function ReviewsTable({ reviews, onExport, onExportDefault }: ReviewsTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <h3 className="text-[15px] font-bold flex items-center gap-2">
          리뷰
          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
            {reviews.length}건
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onExportDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all"
          >
            <DownloadIcon />
            빠른 저장
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
          >
            <FileIcon />
            Excel 저장
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 text-slate-500">
              <th className="w-14 text-center font-semibold text-[11px] uppercase tracking-wide py-2.5 px-4 border-b border-slate-200">
                No.
              </th>
              <th className="text-left font-semibold text-[11px] uppercase tracking-wide py-2.5 px-4 border-b border-slate-200">
                작성자
              </th>
              <th className="w-24 text-left font-semibold text-[11px] uppercase tracking-wide py-2.5 px-4 border-b border-slate-200">
                별점
              </th>
              <th className="text-left font-semibold text-[11px] uppercase tracking-wide py-2.5 px-4 border-b border-slate-200">
                제목
              </th>
              <th className="min-w-[200px] text-left font-semibold text-[11px] uppercase tracking-wide py-2.5 px-4 border-b border-slate-200">
                내용
              </th>
              <th className="text-left font-semibold text-[11px] uppercase tracking-wide py-2.5 px-4 border-b border-slate-200">
                작성일
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, i) => (
              <tr key={review.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="text-center text-slate-400 py-2.5 px-4 border-b border-slate-100">
                  {i + 1}
                </td>
                <td className="py-2.5 px-4 border-b border-slate-100">
                  {review.userName}
                </td>
                <td className="py-2.5 px-4 border-b border-slate-100">
                  <Stars count={review.rating} />
                </td>
                <td className="py-2.5 px-4 border-b border-slate-100">
                  {review.title}
                </td>
                <td className="py-2.5 px-4 border-b border-slate-100">
                  <div className="line-clamp-2 leading-relaxed max-w-xs">
                    {review.text}
                  </div>
                </td>
                <td className="py-2.5 px-4 border-b border-slate-100 whitespace-nowrap">
                  {review.date ? String(review.date).slice(0, 10) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
