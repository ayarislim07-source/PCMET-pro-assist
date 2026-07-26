import { ReactNode } from 'react';

export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:border-slate-600' : ''} ${className}`}>
      {children}
    </div>
  );
}
