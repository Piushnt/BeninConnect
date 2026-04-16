import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaginationProps {
  total: number;
  current: number;
  pageSize: number;
  onChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  total, 
  current, 
  pageSize, 
  onChange,
  onPageSizeChange 
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startRange = (current - 1) * pageSize + 1;
  const endRange = Math.min(current * pageSize, total);

  if (total === 0) return null;

  return (
    <div className="p-6 bg-gray-50/50 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Affichage {startRange}-{endRange} sur {total}
        </span>
        {onPageSizeChange && (
          <select 
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest px-2 py-1 outline-none dark:text-white cursor-pointer"
          >
            <option value={5}>5 par page</option>
            <option value={10}>10 par page</option>
            <option value={20}>20 par page</option>
            <option value={50}>50 par page</option>
          </select>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className={cn(
            "p-2 rounded-xl border border-gray-100 dark:border-white/10 transition-all",
            current === 1 
              ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-white/5 text-gray-400" 
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Simple pagination window logic
            let pageNum = i + 1;
            if (totalPages > 5 && current > 3) {
              pageNum = current - 2 + i;
              if (pageNum + (4 - i) > totalPages) {
                pageNum = totalPages - 4 + i;
              }
            }
            
            if (pageNum > totalPages) return null;

            return (
              <button
                key={pageNum}
                onClick={() => onChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-xl text-[10px] font-bold transition-all",
                  current === pageNum
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-100 dark:border-white/10"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          className={cn(
            "p-2 rounded-xl border border-gray-100 dark:border-white/10 transition-all",
            current === totalPages 
              ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-white/5 text-gray-400" 
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
