/** Compact relative time: "just now", "5m ago", "3h ago", "2d ago", or absolute date for older. */
export function formatRelativeTime(input: string | Date): string {
 const date = typeof input === 'string' ? new Date(input) : input;
 const diffMs = Date.now() - date.getTime();
 const diffSec = Math.floor(diffMs / 1000);

 if (diffSec < 45) return 'just now';
 if (diffSec < 90) return '1m ago';

 const diffMin = Math.floor(diffSec / 60);
 if (diffMin < 60) return `${diffMin}m ago`;

 const diffHr = Math.floor(diffMin / 60);
 if (diffHr < 24) return `${diffHr}h ago`;

 const diffDay = Math.floor(diffHr / 24);
 if (diffDay < 7) return `${diffDay}d ago`;

 // Older than a week — show absolute date
 return date.toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
 });
}
