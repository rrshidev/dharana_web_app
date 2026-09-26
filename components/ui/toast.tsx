import type { ReactNode } from "react";

export function Toast({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-toast-in rounded-full border border-night-line bg-night/95 px-4 py-2 text-sm text-ink shadow-lg shadow-black/30 backdrop-blur"
    >
      <span className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-accent"
          aria-hidden
        >
          <path d="m4 12 5 5L20 6" />
        </svg>
        {children}
      </span>
    </div>
  );
}