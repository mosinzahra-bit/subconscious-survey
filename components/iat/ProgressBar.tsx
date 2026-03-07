interface ProgressBarProps {
  value: number; // 0-100
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden border border-[var(--border)]">
      <div
        className="h-full bg-gradient-to-r from-[var(--green-muted)] via-[var(--green-vivid)] to-[var(--gold)] transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

